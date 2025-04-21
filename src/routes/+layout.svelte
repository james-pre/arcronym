<script lang="ts">
	import { Icon, UserCard } from '@axium/server/web';
	const { children, data } = $props();
	const user = $derived(data.user);
</script>

<nav>
	<a href="/">Home</a>
	{#if user}
		<a href="/users/{user.id}">Profile</a>
	{/if}
	<a href="/courses">Courses</a>
	<a href="/friends">Friends</a>
</nav>

<div id="user-menu">
	{#if user}
		<UserCard {user} self href="/account" />
	{:else}
		<a href="/auth/signin">
			<button class="button">
				<Icon i="light/right-to-bracket" />
				Sign in
			</button>
		</a>
	{/if}
</div>

{@render children()}

<style>
	nav {
		display: flex;
		gap: 2em;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 3em;
		padding: 1em 2em;
		background: #222225;
		border-bottom: 1px solid #445;
		align-items: center;
	}

	:global(body) {
		background: #222;
		color: #ccc;
		inset: 3em 0 0;
		position: fixed;
		margin: 0;
		padding: 1em 0 0;
	}

	#user-menu {
		display: flex;
		gap: 1em;
		position: fixed;
		right: 1em;
		top: 0.5em;
		padding-bottom: 1em;
		z-index: 10;
		align-items: center;
	}
</style>
