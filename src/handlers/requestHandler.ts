import { KnownHandler } from 'enums/KnownHandler';
import { MethodType } from 'enums/MethodType';
import { TRequest } from 'interfaces/TRequest';
import { TResponse } from 'interfaces/TResponse';
import { getAttrsOnEntry, getValidHandler } from 'utils/server';
import { defaultHandler } from './defaultHandler';
import { ApiVersion } from 'enums/ApiVersion';

export const requestHandler = async (request: TRequest, response: TResponse) => {
	const { handler, method, requestedApiVersion, slug } = getAttrsOnEntry(request);

	const validHandler = getValidHandler({ handler, method, requestedApiVersion, slug });

	if (validHandler) {
		return validHandler(request, response);
	}

	return defaultHandler(request, response);
};
