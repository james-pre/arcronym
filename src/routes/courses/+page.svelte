<script lang="ts">
	import type { Course } from '$lib/data.js';
	import { FormDialog, Icon } from '@axium/server/web';
	import CourseForm from '$components/CourseForm.svelte';

	const { form, data } = $props();

	let creating = $state(false);
	let removing: Course | null = $state(null);
	let editing: Course | null = $state(null);

	function actionHandler(action: string, course: Course) {
		return (e: MouseEvent) => {
			e.preventDefault();
			if (action == 'edit') editing = course;
			else if (action == 'remove') removing = course;
		};
	}
</script>

<svelte:head>
	<title>Your Courses</title>
</svelte:head>

<div class="header">
	<h1>Your Courses</h1>
</div>

<div id="courses" class="content">
	{#each data.courses as course}
		<a href="/courses/{course.id}" class="course">
			<span>{course.name}</span>
			<span class="subtle">
				{#if course.description}{course.description}
				{:else}<i>No description</i>
				{/if}
			</span>
			<div class="action" onclick={actionHandler('edit', course)}><Icon i="pencil" /></div>
			<div class="action" onclick={actionHandler('remove', course)}><Icon i="trash" /></div>
		</a>
	{/each}

	{#if !data.courses.length}
		<p>You don't have any courses yet.</p>
	{/if}

	<div class="button" onclick={() => (creating = true)}><Icon i="plus" />New Course</div>
</div>

<FormDialog bind:active={removing} {form} submitText="Delete" action="?/remove" name="remove">
	<p>
		Are you sure you want to delete <strong>{removing?.name}</strong>? This action cannot be undone.
		<br />
		Deleting a course will remove all of its contents, including any projects and resources.
	</p>
	<input type="hidden" name="id" id="course-id" value={removing?.id} />
</FormDialog>

<CourseForm bind:course={creating} {form} isNew={true} />
<CourseForm bind:course={editing} {form} />

<style>
	.course {
		display: grid;
		grid-template-columns: 1fr 4fr 2em 2em;
		align-items: center;
		gap: 0.5em;
		border-radius: 0.5em;
		border: 1px solid #9999;
		padding: 1em 2em;
	}

	.course:hover {
		background: #334;
	}

	.action {
		cursor: pointer;
	}

	:global(form[name='remove'] button.submit) {
		background: #733;
	}

	:global(button) {
		outline: none;
	}
</style>
