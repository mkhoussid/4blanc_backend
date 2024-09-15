import { executeQuery } from 'db/executeQuery';
import { TableName } from 'enums/TableName';
import { promises as fs } from 'fs';
import path from 'path';
import { generateMockData } from './mocks';

export const NOW = (config?: { addMonths?: number; addDays?: number; addHours?: number; addMinutes?: number }) => {
	let time = `CURRENT_TIMESTAMP(0) AT TIME ZONE 'UTC'`;

	if (config) {
		time += ` + interval '${config.addMonths || 0} month, ${config.addDays || 0} days, ${
			config.addHours || 0
		} hours, ${config.addMinutes || 0} minutes'`;
	}

	return time;
};

export const preparedOrderedValuesForParameterizedQuery = ({ numberOfValues }: { numberOfValues: number }) =>
	Array.from({ length: numberOfValues }, (_, index) => `$${index + 1}`);

// always reset DB on boot
export const initSql = async () => {
	const schema = process.env.POSTGRES_SCHEMA as string;

	console.log('Initializing db...');

	await executeQuery({
		query: `DROP SCHEMA IF EXISTS ${schema} CASCADE;`,
		table: null,
	});

	console.log(`Schema ${schema} dropped`);

	await executeQuery({
		query: `CREATE SCHEMA IF NOT EXISTS ${schema};`,
		table: null,
	});

	const sql = await fs.readFile(path.join('src', 'sql', 'init-db.sql'), 'utf-8');

	await executeQuery({
		query: sql.replaceAll('%%', schema),
		table: null,
	});

	console.log(`Init SQL tables created`);

	return generateMockData();
};

export const generateTableName = (tableName: TableName) => [process.env.POSTGRES_SCHEMA, tableName].join('.');

export const getDbRecordRequestLimit = () => +(process.env.DB_REQ_RECORD_LIMIT ?? '0');
