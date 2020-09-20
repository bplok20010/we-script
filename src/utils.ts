import { Interpreter } from "eval5";
import { request, requestOptions, SuccessCallbackResult, FailCallbackResult } from "./adapter";

const loadCachedScript: Record<string, string> = Object.create(null);

const SCRIPT_EXEC_TIMEOUT = 600000;

// 基本方法注入
const rootContext = {
	console,
	setTimeout,
	clearTimeout,
	setInterval,
	clearInterval,
	wx: typeof wx === "undefined" ? undefined : wx,
};

export const globalContext: Record<any, any> = {};

export function evalScript<T extends Record<any, any>>(code: string, context?: T) {
	if (!code) return;

	const interpreter = new Interpreter(context || globalContext, {
		timeout: SCRIPT_EXEC_TIMEOUT,
		rootContext: rootContext,
		globalContextInFunction: context || globalContext,
	});

	interpreter.evaluate(code);

	return interpreter.getValue();
}

export function loadScript(requestOpts: requestOptions, useCache = true) {
	const url = requestOpts.url;

	return new Promise<{
		url: string;
		data: string;
	}>((resolve, reject) => {
		if (useCache && url in loadCachedScript) {
			resolve({
				url,
				data: loadCachedScript[url],
			});
			return;
		}

		request(
			Object.assign({}, requestOpts, {
				success(res: SuccessCallbackResult) {
					loadCachedScript[url] = res.data;
					resolve({
						url,
						data: res.data,
					});
				},
				fail(err: FailCallbackResult) {
					reject(new Error(err.errMsg));
				},
			})
		);
	});
}

interface RunCache {
	__weScriptRunCache__: Record<string, boolean>;
}

export function hasRunInContext(ctx: Record<any, any> & RunCache, url: string) {
	return ctx && ctx.__weScriptRunCache__ && ctx.__weScriptRunCache__[url];
}

export function setRunInContext(ctx: Record<any, any> & RunCache, url: string) {
	if (!ctx) return;

	if (!ctx.__weScriptRunCache__) {
		Object.defineProperty(ctx, "__weScriptRunCache__", {
			enumerable: false,
			value: Object.create(null),
		});
	}
	ctx.__weScriptRunCache__[url] = true;
}
