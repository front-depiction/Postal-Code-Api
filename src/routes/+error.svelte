<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { Button } from '$components/ui/button';

	// (with some funny illustration maybe)
	console.log('Error:', $page.status, $page.error);
</script>

<div
	class="mx-auto flex h-full min-h-dvh w-full max-w-screen-xl flex-col items-center justify-center gap-8 px-8 pb-8 xl:border-l xl:border-r"
>
	<div class="flex w-full flex-col items-center gap-4">
		<div class="flex flex-wrap gap-2 text-5xl font-bold">
			<h1 class="w-fit bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
				{$page.status}
			</h1>
			<h1>{$page.error?.message}</h1>
			<!-- <h1 class="text-4xl font-bold text-primary/80">{extensions[0]}</h1> -->
		</div>
		<p class="w-full text-center text-2xl font-light text-muted-foreground">
			{#if $page.status === 404}
				Oops! You've wandered off the map and fallen into the void. Let's teleport you back to
				reality!
			{:else if $page.status === 500}
				Looks like our servers are having a siesta. Wakey wakey, servers!
			{:else if $page.status === 403}
				Access denied! You shall not pass without the secret password.
			{:else if $page.status === 401}
				Unauthorized! Even our servers don't know who you are.
			{:else if $page.status === 400}
				Bad request! Our servers are a bit picky, you see.
			{:else if $page.status === 503}
				Service unavailable! Our servers are on a coffee break.
			{/if}
		</p>
	</div>

	<Button
		href="/"
		class="shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
		variant="default">Bring me back home</Button
	>
</div>
