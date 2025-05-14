<script lang="ts">
	import type { Task } from '../types';

	// Props for the component: the task data and callback functions.
	let {
		task,
		onToggleComplete,
		onDelete,
		onDragStart,
		onDragOverItem,
		onDropOnItem,
		onDragEndItem
	}: {
		task: Task;
		onToggleComplete: (taskId: string) => void;
		onDelete: (taskId: string) => void;
		onDragStart: (event: DragEvent, taskId: string) => void;
		onDragOverItem: (event: DragEvent, targetTaskId: string) => void;
		onDropOnItem: (event: DragEvent, targetTaskId: string) => void;
		onDragEndItem: (event: DragEvent) => void;
	} = $props();

	// SVG path for a simple trash icon
	const trashIconPath =
		'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16';

	function handleDragStart(event: DragEvent) {
		onDragStart(event, task.id);
		// Add a class to the dragged element for visual feedback
		(event.target as HTMLElement).classList.add('dragging');
	}

	function handleDragEnd(event: DragEvent) {
		(event.target as HTMLElement).classList.remove('dragging');
		onDragEndItem(event);
	}
</script>

<div
	draggable="true"
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	ondragover={(event) => onDragOverItem(event, task.id)}
	ondrop={(event) => onDropOnItem(event, task.id)}
	class="flex cursor-grab items-center rounded-md bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-700"
	role="listitem"
	aria-labelledby="task-desc-{task.id}"
>
	<input
		type="checkbox"
		checked={task.completed}
		onchange={() => onToggleComplete(task.id)}
		class="mr-3 h-5 w-5 flex-shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-500"
		aria-label="Complete task"
	/>
	<div class="flex-grow">
		<p
			id="task-desc-{task.id}"
			class="text-sm font-medium text-slate-900 dark:text-slate-100 {task.completed
				? 'text-slate-500 line-through dark:text-slate-400'
				: ''}"
		>
			{task.description}
		</p>
		<p class="text-xs text-slate-500 dark:text-slate-400">
			Value: {task.minutes} min{task.minutes === 1 ? '' : 's'}
		</p>
	</div>
	<button
		onclick={() => onDelete(task.id)}
		class="ml-3 rounded-full p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:hover:bg-red-700 dark:hover:text-red-300 dark:focus:ring-offset-slate-700"
		aria-label="Delete task {task.description}"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d={trashIconPath} />
		</svg>
	</button>
</div>
