import { createTask } from 'db/common/tasks';
import { TaskDTOField } from 'enums/TaskDTOField';
import { NOW } from './db';
import { TaskDTO } from 'interfaces/TaskDTO';
import { WithOmittable } from 'interfaces/WithOmittable';
import { executeQuery } from 'db/executeQuery';
import { TableName } from 'enums/TableName';

const MOCK_DATA_COUNT = +(process.env.MOCK_DATA_COUNT ?? '1');
const getFutureDeadlineDate = (hours: number) => hours * 60 * 60 * 1000;

export const generateMockData = async () => {
	const promises: Promise<TaskDTO>[] = [];

	Array.from({ length: MOCK_DATA_COUNT }, (_, index) => {
		const now = new Date();
		now.setTime(now.getTime() + getFutureDeadlineDate(index + 1));

		const [date, time] = now.toISOString().split('T');

		promises.push(
			createTask({
				[TaskDTOField.Id]: index + 1,
				[TaskDTOField.Title]: `Задача ${index + 1}`,
				[TaskDTOField.DeadlineDate]: [date, time].join(' '),
				[TaskDTOField.Author]: `Автор ${index + 1}`,
				[TaskDTOField.Status]: `Статус ${index + 1}`,
				[TaskDTOField.Description]: `Описание ${index + 1}`,
			} as WithOmittable<TaskDTO>),
		);
	});

	await Promise.all(promises);

	await executeQuery({
		table: TableName.Task,
		query: `
	        ALTER SEQUENCE _4blanc.task_id_seq RESTART WITH ${MOCK_DATA_COUNT + 1};
	    `,
	});
};
