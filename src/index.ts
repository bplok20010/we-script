import { evalScript, loadScript, hasRunInContext, setRunInContext, globalContext } from "./utils";

const PENDING = 0;
const COMPLETED = 1;

function attached(this: any) {
	const { src, timeout, cache, text, once } = this.data;
	let context: any = globalContext;

	let isInit = true;

	this.triggerEvent("onInit", {
		getContext() {
			return context;
		},
		setContext(ctx: Record<any, any>) {
			if (!isInit) {
				return;
			}
			context = ctx;
		},
	});

	isInit = false;

	if (text) {
		Promise.resolve()
			.then(() => {
				evalScript(text, context);

				this.triggerEvent("onLoad", {
					context,
				});

				this.setData({
					loadStatus: COMPLETED,
				});
			})
			.catch((e) => {
				this.triggerEvent("onError", { error: e });
			});
		return;
	}

	if (!src) {
		this.triggerEvent("onLoad", {
			context,
		});
		return;
	}

	const scriptUrls = Array.isArray(src) ? src : [src];

	const promises = scriptUrls.map((url) => {
		return loadScript(
			{
				url,
				timeout,
				method: "GET",
			},
			cache
		);
	});

	Promise.all(promises)
		.then((codes) => {
			codes.forEach((code) => {
				if (!(once && hasRunInContext(context, code.url))) {
					evalScript(code.data, context);
					setRunInContext(context, code.url);
				}
			});

			this.triggerEvent("onLoad", {
				context,
			});

			this.setData({
				loadStatus: COMPLETED,
			});
		})
		.catch((e) => {
			this.triggerEvent("onError", { error: e });
		});
}

Component({
	properties: {
		src: {
			type: String,
			optionalTypes: [String, Array],
		},
		text: String,
		// 无效
		type: String,
		// 无效
		context: {
			type: Object,
			value: globalContext,
		},
		timeout: {
			type: Number,
			value: 60000,
		},
		cache: {
			type: Boolean,
			value: true,
		},
		once: {
			type: Boolean,
			value: true,
		},
	},
	data: {
		loadStatus: PENDING,
		PENDING,
		COMPLETED,
	},
	lifetimes: {
		attached,
	},
	attached,
});
