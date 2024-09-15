import { TRequest } from 'interfaces/TRequest';
import { TResponse } from 'interfaces/TResponse';
import { sendResponse } from 'utils/server';

export const defaultHandler = (request: TRequest, response: TResponse) =>
	sendResponse({ request, response, message: `API not found at ${request.url}` });
