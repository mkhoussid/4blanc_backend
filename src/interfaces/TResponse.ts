import http from 'http';
import { TRequest } from './TRequest';

export type TResponse = http.ServerResponse<TRequest>;
