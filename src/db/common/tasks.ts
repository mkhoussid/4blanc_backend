import { executeQuery, TValue } from 'db/executeQuery';
import { TableName } from 'enums/TableName';
import { TaskDTOField } from 'enums/TaskDTOField';
import { FetchTasksResult } from 'interfaces/FetchTasksResult';
import { WithOmittable } from 'interfaces/WithOmittable';
import { TaskDTO } from 'src/interfaces/TaskDTO';
import { generateTableName, getDbRecordRequestLimit, preparedOrderedValuesForParameterizedQuery } from 'utils/db';

export const createTask = (fields: WithOmittable<TaskDTO>) => {
	const columns = Object.keys(fields);
	const values = Object.values(fields);

	return executeQuery<TaskDTO>({
		table: TableName.Task,
		query: `
			INSERT INTO
                ${generateTableName(TableName.Task)} (
                    ${columns.join(',')}
                )
			VALUES (
                ${preparedOrderedValuesForParameterizedQuery({ numberOfValues: columns.length })}
            )
		`,
		values: values,
		returnSingleton: true,
		returnAll: true,
	});
};

const getButtonsToRight = (tasksLength: number) => {
	if (tasksLength > 20) {
		return 2;
	}

	if (tasksLength > 10) {
		return 1;
	}

	return 0;
};

const topCountMap = {
	0: 51,
	1: 41,
};

const buttonsToRightMap = {
	31: 2,
	41: 3,
	51: 4,
};
export const fetchTasks = async ({
	page: _page,
	taskSearchQuery,
}: {
	page: number | 'end';
	taskSearchQuery?: string;
}): Promise<FetchTasksResult> => {
	const dbRecordRequestLimit = getDbRecordRequestLimit();
	const adjustedPage = +_page - 1;

	const [offset, ...rest] = (
		[
			Math.max(0, dbRecordRequestLimit * adjustedPage),
			taskSearchQuery && ['%', taskSearchQuery, '%'].join(''),
		] as TValue[]
	).filter((value) => typeof value !== 'undefined');

	const topCount = topCountMap[adjustedPage as keyof typeof topCountMap] ?? 31;

	const tasks = await executeQuery<TaskDTO[]>({
		table: TableName.Task,
		query: `
			SELECT
				${TaskDTOField.Id},
				${TaskDTOField.Title},
				${TaskDTOField.DeadlineDate}
			FROM
				${generateTableName(TableName.Task)}
			${taskSearchQuery ? `WHERE ${TaskDTOField.Title} ILIKE $4` : ''}
			ORDER BY ${TaskDTOField.Id} $3
			OFFSET $2
			FETCH FIRST $1 ROWS ONLY
		`,
		values: [topCount, offset, , ...rest],
	});

	const buttonsToRight =
		buttonsToRightMap[tasks.length as keyof typeof buttonsToRightMap] ?? getButtonsToRight(tasks.length);

	console.log('buttonsToRight', { buttonsToRight, l: tasks.length });
	return {
		tasks: tasks.slice(0, dbRecordRequestLimit),
		buttonsToRight,
	};
	// return executeQuery<TaskDTO[]>({
	// 	table: TableName.Task,
	// 	query: `
	// 		SELECT
	// 			${TaskDTOField.Id},
	// 			${TaskDTOField.Title},
	// 			${TaskDTOField.DeadlineDate}
	// 		FROM
	// 			${generateTableName(TableName.Task)}
	// 		${taskSearchQuery ? `WHERE ${TaskDTOField.Title} ILIKE $2` : ''}
	// 		ORDER BY ${TaskDTOField.Id} ASC
	// 		OFFSET $1
	// 		LIMIT 10
	// 	`,
	// 	values:[offset, ...rest],
	// });
};

// export const fetchTasksCount = async (args?: { taskSearchQuery?: string }): Promise<number> => {
// 	const taskSearchQuery = args?.taskSearchQuery;
// 	const values = [taskSearchQuery && ['%', taskSearchQuery, '%'].join('')].filter(Boolean) as string[];

// 	const result = await executeQuery<{ count: number }>({
// 		table: TableName.Task,
// 		query: `
// 			SELECT
// 				COUNT(*)
// 			FROM
// 				${generateTableName(TableName.Task)}
// 			${taskSearchQuery ? `WHERE ${TaskDTOField.Title} ILIKE $1` : ''}
// 		`,
// 		returnSingleton: true,
// 		values,
// 	});

// 	return result.count;
// };

export const fetchTask = (taskId: number) =>
	executeQuery<TaskDTO | null>({
		table: TableName.Task,
		query: `
			SELECT
				${TaskDTOField.Id},
				${TaskDTOField.Title},
				${TaskDTOField.DeadlineDate},
				${TaskDTOField.Author},
				${TaskDTOField.Status},
				${TaskDTOField.Description}
			FROM
				${generateTableName(TableName.Task)}
			WHERE ${TaskDTOField.Id} = $1
		`,
		values: [taskId],
		returnSingleton: true,
	});
