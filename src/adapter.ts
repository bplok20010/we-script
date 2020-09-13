/**
 * lib.wx.api.d.ts
 */
type IAnyObject = Record<string, any>;

type RequestFailCallback = (res: GeneralCallbackResult) => void;

interface RequestSuccessCallbackResult {
	data: string | IAnyObject | ArrayBuffer;
	header: IAnyObject;
	statusCode: number;
	errMsg: string;
}

type RequestSuccessCallback = (result: RequestSuccessCallbackResult) => void;

interface GeneralCallbackResult {
	errMsg: string;
}

type RequestCompleteCallback = (res: GeneralCallbackResult) => void;

export interface requestOptions {
	/** 开发者服务器接口地址 */
	url: string;
	/** 接口调用结束的回调函数（调用成功、失败都会执行） */
	complete?: RequestCompleteCallback;
	/** 请求的参数 */
	data?: string | IAnyObject | ArrayBuffer;
	mode?: any; // 微信小程序无效
	credentials?: any; // 微信小程序无效
	timeout?: number;
	/** 返回的数据格式
	 *
	 * 可选值：
	 * - 'json': 返回的数据为 JSON，返回后会对返回的数据进行一次 JSON.parse;
	 * - '其他': 不对返回的内容进行 JSON.parse; */
	dataType?: "json" | "其他";
	/** 接口调用失败的回调函数 */
	fail?: RequestFailCallback;
	/** 设置请求的 header，header 中不能设置 Referer。
	 *
	 * `content-type` 默认为 `application/json` */
	header?: IAnyObject;
	/** HTTP 请求方法
	 *
	 * 可选值：
	 * - 'OPTIONS': HTTP 请求 OPTIONS;
	 * - 'GET': HTTP 请求 GET;
	 * - 'HEAD': HTTP 请求 HEAD;
	 * - 'POST': HTTP 请求 POST;
	 * - 'PUT': HTTP 请求 PUT;
	 * - 'DELETE': HTTP 请求 DELETE;
	 * - 'TRACE': HTTP 请求 TRACE;
	 * - 'CONNECT': HTTP 请求 CONNECT; */
	method?: "OPTIONS" | "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT";
	/** 响应的数据类型
	 *
	 * 可选值：
	 * - 'text': 响应的数据为文本;
	 * - 'arraybuffer': 响应的数据为 ArrayBuffer;
	 *
	 * 最低基础库： `1.7.0` */
	responseType?: "text" | "arraybuffer";
	/** 接口调用成功的回调函数 */
	success?: RequestSuccessCallback;
}

export type SuccessCallbackResult = RequestSuccessCallbackResult & {
	data: string;
};
export type FailCallbackResult = GeneralCallbackResult;

export function request(options: requestOptions) {
	wx.request(options);
}
