import { ApiVersion } from 'enums/ApiVersion';
import { KnownHandler } from 'enums/KnownHandler';
import { MethodType } from 'enums/MethodType';
import { TRequest } from 'interfaces/TRequest';
import { TResponse } from 'interfaces/TResponse';
import { handlers } from 'src/handlers';

export const getAttrsOnEntry = (request: TRequest) => {
	const reqUrl = (request.url ?? '').replace(/^\/api\//, '');
	const method = (request.method?.toLowerCase() ?? 'get') as MethodType;
	const [requestedApiVersion, handler, slug] = reqUrl.split('/') as [
		ApiVersion,
		KnownHandler,
		string | undefined,
	]; // can be made more generic, however based on the requirements, this suffices

	return {
		requestedApiVersion,
		method,
		handler,
		slug,
	};
};

export const getValidHandler = ({
	handler,
	method,
	requestedApiVersion,
	slug,
}: {
	handler: KnownHandler;
	method: MethodType;
	requestedApiVersion: ApiVersion;
	slug?: string;
}): ((request: TRequest, response: TResponse) => void) | undefined =>
	handlers['api'][requestedApiVersion]?.[handler.split('?')[0] as KnownHandler]?.[method](slug);

const corsHeaders = (request: TRequest) => ({
	'Access-Control-Allow-Origin': '*' /* @dev First, read about security */,
	'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
	'Access-Control-Max-Age': 2592000, // 30 days
	// @ts-expect-error
	'Access-Control-Allow-Headers': request.header?.origin ?? '*',
	'Content-Type': 'application/json',
});

interface SendResponseArgsBase {
	request: TRequest;
	response: TResponse;
}
interface SendResponseMessage extends SendResponseArgsBase {
	message: string;
	data?: never;
}
interface SendResponseData extends SendResponseArgsBase {
	message?: never;
	data: Record<string, unknown>;
}
export const sendResponse = ({ request, response, message, data }: SendResponseMessage | SendResponseData) => {
	response.writeHead(200, corsHeaders(request));
	response.write(JSON.stringify(message ? { message } : data));
	response.end();
};

export const getRequestParams = <T = string>(request: TRequest, param: string): T => {
	const query = request.url?.split('?') ?? '';
	const result: Record<string, string> = {};

	if (query.length >= 2) {
		query[1].split('&').forEach((item) => {
			try {
				result[item.split('=')[0]] = item.split('=')[1];
			} catch (e) {
				result[item.split('=')[0]] = '';
			}
		});
	}

	return result[param] as T;
};

export const sendRedirect = (request: TRequest, response: TResponse) => {
	sendResponse({
		request,
		response,
		data: { redirect: true },
	});
};
