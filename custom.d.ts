import { FastifyRedis } from '@fastify/redis';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import {
	ContextConfigDefault,
	FastifyReply,
	FastifySchema,
	RawReplyDefaultExpression,
	RawRequestDefaultExpression,
	RawServerDefault,
	RouteGenericInterface,
} from 'fastify';
import { FastifyRequest } from 'fastify/types/request';
import { RequestInstanceUser } from 'interfaces/RequestInstanceUser';
import { SocketServer } from 'interfaces/SocketIO';

export interface EnvVars {
	TS_NODE_BASEURL: string;
	POSTGRES_USER: string;
	POSTGRES_PASSWORD: string;
	POSTGRES_HOST: string;
	POSTGRES_DB: string;
	POSTGRES_SCHEMA: string;
	POSTGRES_PORT: string;
	DB_REQ_RECORD_LIMIT: string;
	NODE_ENV: 'development' | 'production';
	PORT: string;
	MOCK_DATA_COUNT: string;
}

declare global {
	namespace NodeJS {
		export interface ProcessEnv extends EnvVars {}
	}
}
