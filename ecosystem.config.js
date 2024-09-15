module.exports = {
	apps: [
		{
			name: `temp_backed`,
			node_args: '-r ts-node/register -r tsconfig-paths/register',
			script: 'build/index.js',
			env: {
				PORT: 8700,
				TS_NODE_BASEURL: './build',
				POSTGRES_USER: 'postgres',
				POSTGRES_PASSWORD: 'postgres',
				POSTGRES_HOST: '193.124.114.21',
				POSTGRES_DB: 'dev',
				POSTGRES_SCHEMA: '_4blanc',
				POSTGRES_PORT: '5432',
				DB_REQ_RECORD_LIMIT: '10',
				NODE_ENV: 'development',
				MOCK_DATA_COUNT: '1000',
			},
		},
	],
};
