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

	return new Promise<string>((resolve, reject) => {
		if (useCache && url in loadCachedScript) {
			resolve(loadCachedScript[url]);
			return;
		}

		request(
			Object.assign({}, requestOpts, {
				success(res: SuccessCallbackResult) {
					resolve((loadCachedScript[url] = res.data));
				},
				fail(err: FailCallbackResult) {
					reject(new Error(err.errMsg));
				},
			})
		);
	});
}
