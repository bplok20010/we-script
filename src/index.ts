import { evalScript, loadScript } from "./utils";

const PENDING = 0;
const COMPLETED = 1;

function attached() {
	const { context, src, timeout, cache, text } = this.data;

	if (text) {
		try {
			evalScript(text, context);

			this.triggerEvent("onExecSuccess");

			this.setData({
				loadStatus: COMPLETED,
			});
		} catch (e) {
			this.triggerEvent("onExecError", e);
		}
		return;
	}

	if (!src) {
		return;
	}

	const scriptUrls = Array.isArray(src) ? src : [src];

	const promises = scriptUrls.map((url) => {
		return loadScript(
			{
				url,
				timeout,
				mode: "cors",
				credentials: "include",
				method: "GET",
			},
			cache
		);
	});

	Promise.all(promises)
		.then((codes) => {
			let execErr: Error | null = null;
			try {
				codes.forEach((code) => {
					evalScript(code, context);
				});
			} catch (e) {
				execErr = e;
				this.triggerEvent("onExecError", e);
			}

			if (!execErr) {
				this.triggerEvent("onExecSuccess");

				this.triggerEvent("onLoad");

				this.setData({
					loadStatus: COMPLETED,
				});
			} else {
				throw execErr;
			}
		})
		.catch((err) => {
			this.triggerEvent("onError", err);
		});
}

Component({
	properties: {
		src: {
			type: String,
			optionalTypes: [String, Array],
		},
		text: String,
		type: String,
		context: Object,
		timeout: {
			type: Number,
			value: 10000,
		},
		cache: {
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
