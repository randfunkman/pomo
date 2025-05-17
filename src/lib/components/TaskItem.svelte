<script lang="ts">
	import type { Task } from '../types';

	// Props for the component: the task data and callback functions.
	let {
		task,
		onToggleComplete,
		onDelete,
		onUpdateTask,
		onDragStart,
		onDragOverItem,
		onDropOnItem,
		onDragEndItem
	}: {
		task: Task;
		onToggleComplete: (taskId: string) => void;
		onDelete: (taskId: string) => void;
		onUpdateTask: (taskId: string, newDescription: string, newMinutes: number) => void;
		onDragStart: (event: DragEvent, taskId: string) => void;
		onDragOverItem: (event: DragEvent, targetTaskId: string) => void;
		onDropOnItem: (event: DragEvent, targetTaskId: string) => void;
		onDragEndItem: (event: DragEvent) => void;
	} = $props();

	let isEditing = $state(false);
	let editedDescription = $state(task.description);
	let editedMinutes = $state(task.minutes);

	const trashIconPath =
		'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16';
	const editIconPath =
		'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z';
	const saveIconPath = 'M5 13l4 4L19 7'; // Checkmark
	const cancelIconPath = 'M6 18L18 6M6 6l12 12'; // X mark

	function handleDragStart(event: DragEvent) {
		if (isEditing) {
			event.preventDefault();
			return;
		}
		onDragStart(event, task.id);
		(event.target as HTMLElement).classList.add('dragging');
	}

	function handleDragEnd(event: DragEvent) {
		(event.target as HTMLElement).classList.remove('dragging');
		onDragEndItem(event);
	}

	function startEditing(): void {
		editedDescription = task.description; // Reset to current task values when starting edit
		editedMinutes = task.minutes;
		isEditing = true;
	}

	function cancelEditing(): void {
		isEditing = false;
		// Values will remain as they were (task.description, task.minutes)
		// or reset them explicitly if needed:
		// editedDescription = task.description;
		// editedMinutes = task.minutes;
	}

	function saveChanges(): void {
		if (editedDescription.trim() === '') {
			// Add user feedback, e.g., highlight field
			console.warn('Description cannot be empty.');
			return;
		}
		if (editedMinutes <= 0) {
			// Add user feedback
			console.warn('Minutes must be positive.');
			return;
		}
		onUpdateTask(task.id, editedDescription.trim(), editedMinutes);
		isEditing = false;
	}

	// Update local edit fields if the task prop changes from parent (e.g., due to external update)
	$effect(() => {
		if (!isEditing) {
			editedDescription = task.description;
			editedMinutes = task.minutes;
		}
	});
</script>

<div
	draggable={!isEditing}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	ondragover={(event) => {
		if (!isEditing) onDragOverItem(event, task.id);
	}}
	ondrop={(event) => {
		if (!isEditing) onDropOnItem(event, task.id);
	}}
	class="flex cursor-grab items-center rounded-md bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-700"
	class:cursor-grab={!isEditing}
	class:cursor-default={isEditing}
	role="listitem"
	aria-labelledby="task-desc-{task.id}"
>
	{#if isEditing}
		<div class="flex-grow space-y-2">
			<input
				type="text"
				bind:value={editedDescription}
				class="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-50"
				aria-label="Edit task description"
			/>
			<input
				type="number"
				bind:value={editedMinutes}
				min="1"
				class="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-50"
				aria-label="Edit task minutes"
			/>
		</div>
		<div class="ml-2 flex flex-shrink-0 space-x-1">
			<button
				onclick={saveChanges}
				class="rounded-full p-1.5 text-green-600 hover:bg-green-100 focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-green-400 dark:hover:bg-green-700"
				aria-label="Save changes"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d={saveIconPath} />
				</svg>
			</button>
			<button
				onclick={cancelEditing}
				class="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 focus:ring-2 focus:ring-slate-400 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-600"
				aria-label="Cancel editing"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d={cancelIconPath} />
				</svg>
			</button>
		</div>
	{:else}
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
		<div class="ml-2 flex flex-shrink-0 space-x-1">
			<button
				onclick={startEditing}
				class="rounded-full p-1.5 text-slate-400 hover:bg-blue-100 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:hover:bg-blue-700 dark:hover:text-blue-300"
				aria-label="Edit task {task.description}"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d={editIconPath} />
				</svg>
			</button>
			<button
				onclick={() => onDelete(task.id)}
				class="rounded-full p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none dark:hover:bg-red-700 dark:hover:text-red-300"
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
	{/if}
</div>
