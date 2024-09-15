import {
	fetchTask,
	fetchTasks,
	// fetchTasksCount
} from 'db/common/tasks';
import { KnownHandler } from 'enums/KnownHandler';
import { MethodType } from 'enums/MethodType';
import { Param } from 'enums/Param';
import { FetchTasksResult } from 'interfaces/FetchTasksResult';
import { TaskDTO } from 'interfaces/TaskDTO';
import { TRequest } from 'interfaces/TRequest';
import { TResponse } from 'interfaces/TResponse';
import { getRequestParams, sendRedirect, sendResponse } from 'utils/server';

// let tasksCount: number | null = null;
// if (!tasksCount) {
// 	const updateTasksCount = async () => {
// 		try {
// 			tasksCount = await fetchTasksCount();
// 		} catch (err) {
// 			console.log(err);
// 		}
// 	};

// 	updateTasksCount();

// 	setInterval(updateTasksCount, 60 * 60 * 1000); // 1hr
// }

export const handlers: Record<
	'api',
	Record<
		'v1',
		Record<
			KnownHandler,
			Record<MethodType, (slug?: string) => (request: TRequest, response: TResponse) => void>
		>
	>
> = {
	api: {
		v1: {
			health: {
				get: () => (request, response) => {
					sendResponse({ request, response, message: 'OK' });
				},
			},
			task: {
				get: (slug) => async (request, response) => {
					try {
						if (slug) {
							const task = await fetchTask(+slug);
							return sendResponse({ request, response, data: { task } });
						}

						const page = +getRequestParams(request, Param.Page);
						let redirect = typeof page === 'undefined' || +page <= 0;

						if (redirect) {
							return sendRedirect(request, response);
						}

						const taskSearchQuery = (() => {
							const taskSearchQuery = getRequestParams(
								request,
								Param.TaskSearchQuery,
							);

							if (!['null'].includes(taskSearchQuery)) {
								return taskSearchQuery;
							}
						})();

						const [
							{ tasks, buttonsToRight },
							// cachedTotalCount,
							// withQueryTotalCount,
						] = (await Promise.all([
							fetchTasks({ page, taskSearchQuery }),
							// tasksCount || fetchTasksCount(),
							// taskSearchQuery ? fetchTasksCount({ taskSearchQuery }) : null,
						])) as [
							FetchTasksResult,
							//number, number?
						];

						redirect = +page > 0 && !taskSearchQuery && tasks.length === 0;

						if (redirect) {
							return sendRedirect(request, response);
						}

						sendResponse({
							request,
							response,
							data: {
								tasks,
								// count: withQueryTotalCount || cachedTotalCount,
								buttonsToRight,
							},
						});
					} catch (err) {
						console.log(err);
					}
				},
			},
		},
	},
};
