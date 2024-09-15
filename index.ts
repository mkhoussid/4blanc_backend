import http from 'http';
import { config } from 'dotenv';
config();

import { connectDb } from 'db/connect';
import { initSql } from 'utils/db';
import { requestHandler } from 'src/handlers/requestHandler';
import { listenHander } from 'src/handlers/listenHandler';

const PORT = +(process.env.PORT || '0');

const start = async () => {
	try {
		await connectDb();
		// await initSql();

		http.createServer(requestHandler).listen(PORT, listenHander(PORT));
	} catch (err) {
		console.log('Error at boot: ', err);
		process.exit(1);
	}
};

start();
