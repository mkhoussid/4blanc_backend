import { db } from './config';

export const connectDb = async (isReconnect = false) => {
	try {
		const PORT = process.env.PORT;
		console.log(`Postgres ${isReconnect ? 're' : ''}connecting from port ${PORT}...`);

		const instance = await db.pool.connect();
		const result = await instance.query('select now();');
		console.log('Healthy Postgres upstream: ', result.rows[0].now);
		instance.release();

		console.log(`Postgres connected from port ${PORT}`);
	} catch (err) {
		console.log('Unable to connect to Postgres', err);
		throw err;
	}
};
