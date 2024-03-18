<script lang="ts">
	import { Button } from '$components/ui/button';
	import { ChevronDown, Code } from 'lucide-svelte';
	import { Icons } from '$components/icons';
	import { ModeSwitcher } from '$components/ui/modeSwitcher';
	import * as Alert from '$components/ui/alert';
</script>

<div
	class="mx-auto flex h-full min-h-screen w-full max-w-screen-md flex-col items-center justify-center gap-8 p-8"
>
	<div class="flex w-full flex-col items-center gap-4">
		<div class="flex flex-wrap gap-2 text-5xl font-bold">
			<h1>Project 1-2</h1>
			<h1 class="w-fit bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
				API
			</h1>
			<!-- <h1 class="text-4xl font-bold text-primary/80">{extensions[0]}</h1> -->
		</div>
		<p class="w-full text-center text-2xl font-light text-muted-foreground">
			Forget about the hassle of working with API's that only work on University VPN's.
		</p>
	</div>

	<div class="flex flex-row gap-4">
		<Button
			href="https://github.com/front-depiction/Postal-Code-Api"
			class="shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
			variant="default"
		>
			<Icons.gitHub class="mr-2 h-6 w-6 shrink-0" />GitHub Repository</Button
		>
		<Button variant="outline" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
			>Download raw CSV</Button
		>
	</div>

	<button class="flex flex-col items-center justify-center gap-2 text-muted-foreground">
		<p>how it works</p>
		<ChevronDown class="h-6 w-6 shrink-0 animate-bounce" />
	</button>

	<Alert.Root>
		<Code class="h-4 w-4" />
		<Alert.Title>Making a request</Alert.Title>
		<Alert.Description class="py-1"
			>You can access the lat and long coordinates of any postal code with a simple GET request.</Alert.Description
		>
		<code class="text-sm font-normal"
			>curl -X GET "https://postal-code-api-phi.vercel.app/latlng/<span class="text-purple-500"
				>[postal code]</span
			>"</code
		>
	</Alert.Root>

	<Alert.Root>
		<Code class="h-4 w-4" />
		<Alert.Title>Response Format</Alert.Title>
		<Alert.Description class="py-1">
			Upon a successful request, the API returns a JSON object containing the postal code, latitude,
			and longitude. Here's an example of a successful response for a given postal code:
		</Alert.Description>
		<div class="relative">
			<pre class="my-2 rounded-md bg-primary/5 p-2"><code class="text-sm font-normal opacity-80">
        {JSON.stringify(
						{
							postalCode: '6227XB',
							latitude: '50.8391149701999',
							longitude: '5.7342847853829'
						},
						null,
						2
					)}
            </code></pre>
			<p class=" absolute right-2 top-2 text-sm text-purple-500">200</p>
		</div>
	</Alert.Root>

	<ModeSwitcher class="absolute right-4 top-4" />
</div>
