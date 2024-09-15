import pg from 'pg';

export const db = {
	pool: new pg.Pool(
		(() => {
			const isDev = process.env.NODE_ENV === 'development';

			return {
				user: process.env.POSTGRES_USER as string,
				password: process.env.POSTGRES_PASSWORD as string,
				host: process.env.POSTGRES_HOST as string,
				port: parseInt(process.env.POSTGRES_PORT as string),
				database: process.env.POSTGRES_DB as string,
				idleTimeoutMillis: 3e4,
				connectionTimeoutMillis: isDev ? 1e6 : 3e4,
				keepAlive: true,
				keepAliveInitialDelayMillis: isDev ? 1e6 : 3e4,
			};
		})(),
	),
};

db.pool.on('error', (err: any) => {
	console.log('Error with db', err);
});

pg.types.setTypeParser(20, (val: any) => +val);
pg.types.setTypeParser(1114, (val: any) => val.toString());
