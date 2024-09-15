import { TaskDTO } from './TaskDTO';

export interface FetchTasksResult {
	tasks: TaskDTO[];
	buttonsToRight: number;
}
