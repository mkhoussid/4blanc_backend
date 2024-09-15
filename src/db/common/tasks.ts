import { executeQuery } from 'db/executeQuery';
import { TableName } from 'enums/TableName';
import { TaskDTOField } from 'enums/TaskDTOField';
import { WithOmittable } from 'interfaces/WithOmittable';
import { TaskDTO } from 'src/interfaces/TaskDTO';
import { generateTableName, preparedOrderedValuesForParameterizedQuery } from 'utils/db';

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

export const fetchTasks = ({ page, taskSearchQuery }: { page: string; taskSearchQuery?: string }) => {
	const values = (
		[
			Math.max(0, +(process.env.DB_REQ_RECORD_LIMIT ?? '0') * (+page - 1)),
			taskSearchQuery && ['%', taskSearchQuery, '%'].join(''),
		] as Array<string | number | boolean>
	).filter((value) => typeof value !== 'undefined');

	return executeQuery<TaskDTO[]>({
		table: TableName.Task,
		query: `
			SELECT
				${TaskDTOField.Id},
				${TaskDTOField.Title},
				${TaskDTOField.DeadlineDate}
			FROM
				${generateTableName(TableName.Task)}
			${taskSearchQuery ? `WHERE ${TaskDTOField.Title} ILIKE $2` : ''}
			ORDER BY ${TaskDTOField.Id} ASC
			OFFSET $1
			LIMIT 10
		`,
		values,
	});
};

export const fetchTasksCount = async (args?: { taskSearchQuery?: string }): Promise<number> => {
	const taskSearchQuery = args?.taskSearchQuery;
	const values = [taskSearchQuery && ['%', taskSearchQuery, '%'].join('')].filter(Boolean) as string[];

	const result = await executeQuery<{ count: number }>({
		table: TableName.Task,
		query: `
			SELECT
				COUNT(*)
			FROM
				${generateTableName(TableName.Task)}
			${taskSearchQuery ? `WHERE ${TaskDTOField.Title} ILIKE $1` : ''}
		`,
		returnSingleton: true,
		values,
	});

	return result.count;
};

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
