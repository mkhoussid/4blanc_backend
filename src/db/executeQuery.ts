import { db } from './config';
import { TableName } from 'enums/TableName';
import { connectDb } from './connect';
import { QueryResult } from 'pg';

export type TValue = string | number | boolean | null | Date | string[] | number[] | Record<string, unknown>;

const getRows = async ({ query, values }: { query: string; values: TValue[] }): Promise<QueryResult<any>> => {
	try {
		const instance = await db.pool.connect();
		const result = await instance.query(query, values);

		instance.release();

		return result;
	} catch (err) {
		console.log('Error, reconnecting...', err);
		setTimeout(() => connectDb(true), 3000); // no max reconnect attempts, just keeps going

		throw err;
	}
};

export const executeQuery = async <T>({
	table,
	query,
	returnSingleton,
	returnAll,
	values = [],
}: {
	table: TableName | null;
	returnSingleton?: boolean;
	returnAll?: boolean;
	query: string;
	values?: TValue[];
}): Promise<T> => {
	try {
		const { rows } = await getRows({ query: returnAll ? query + ' RETURNING *' : query, values });

		if (returnSingleton) {
			return rows?.[0] ?? null;
		}

		return rows as T;
	} catch (err) {
		console.log(`Error caught with query in ${table}`);
		console.log(query);
		console.log(err);

		throw err;
	}
};
