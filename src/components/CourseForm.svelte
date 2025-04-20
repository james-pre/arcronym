<script lang="ts">
	import { FormDialog } from '@axium/server/web';

	let { form, course = $bindable(), isNew = false } = $props();
</script>

<FormDialog bind:active={course} {form} submitText={isNew ? 'Create' : 'Save'} action="?/course_{isNew ? 'create' : 'edit'}">
	<input type="hidden" name="id" value={course?.id} />
	{#if isNew}
		<input type="hidden" name="create" value="true" />
	{/if}
	<div>
		<label for="name">Course Name</label>
		<input id="name" name="name" type="text" value={course?.name} />
	</div>
	<div>
		<label for="description">Description</label>
		<textarea id="description" name="description" value={course?.description}></textarea>
	</div>
</FormDialog>
