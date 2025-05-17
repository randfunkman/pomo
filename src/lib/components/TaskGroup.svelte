<script lang="ts">
	import type { Group, Task } from '../types';
	import TaskItem from './TaskItem.svelte';

	// Props for the component
	let {
		group,
		tasks,
		onToggleComplete,
		onDelete,
		onUpdateTask,
		onDragStartTask,
		onDropInGroup,
		onDragOverItem,
		onDropOnItem,
		onDragEndTask
	}: {
		group: Group;
		tasks: Task[]; // Tasks belonging to this group, already sorted by order
		onToggleComplete: (taskId: string) => void;
		onDelete: (taskId: string) => void;
		onUpdateTask: (taskId: string, newDescription: string, newMinutes: number) => void;
		onDragStartTask: (event: DragEvent, taskId: string) => void;
		onDropInGroup: (event: DragEvent, targetGroupId: string) => void; // For dropping into an empty group or at the end
		onDragOverItem: (event: DragEvent, targetTaskId: string) => void; // For reordering by dropping on an item
		onDropOnItem: (event: DragEvent, targetTaskId: string) => void; // For reordering by dropping on an item
		onDragEndTask: (event: DragEvent) => void;
	} = $props();

	let isDraggingOver = $state(false);

	function handleDragOverGroup(event: DragEvent) {
		event.preventDefault(); // Necessary to allow drop
		event.dataTransfer!.dropEffect = 'move';
		isDraggingOver = true;
	}

	function handleDragLeaveGroup() {
		isDraggingOver = false;
	}

	function handleDropGroup(event: DragEvent) {
		event.preventDefault();
		isDraggingOver = false;
		onDropInGroup(event, group.id);
	}
</script>

<div
	role="group"
	class="flex h-full flex-col rounded-lg p-4 shadow-lg"
	class:bg-slate-50={!isDraggingOver}
	class:dark:bg-slate-800={!isDraggingOver}
	class:bg-blue-100={isDraggingOver}
	class:dark:bg-blue-900={isDraggingOver}
	class:drag-over-group={isDraggingOver}
	ondragover={handleDragOverGroup}
	ondragleave={handleDragLeaveGroup}
	ondrop={handleDropGroup}
	aria-labelledby="group-title-{group.id}"
>
	<h3
		id="group-title-{group.id}"
		class="mb-3 border-b border-slate-300 pb-2 text-lg font-semibold text-slate-800 dark:border-slate-600 dark:text-slate-200"
	>
		{group.name}
	</h3>
	<div class="flex-grow space-y-2 overflow-y-auto pr-1">
		{#if tasks.length === 0}
			<p class="py-4 text-center text-sm text-slate-500 italic dark:text-slate-400">
				No tasks in this group.
			</p>
		{/if}
		{#each tasks as task (task.id)}
			<TaskItem
				{task}
				{onToggleComplete}
				{onDelete}
				{onUpdateTask}
				onDragStart={onDragStartTask}
				{onDragOverItem}
				{onDropOnItem}
				onDragEndItem={onDragEndTask}
			/>
		{/each}
		<div class="min-h-[20px]"></div>
	</div>
</div>
