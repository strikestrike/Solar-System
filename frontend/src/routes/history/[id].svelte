<script context="module">
	export async function preload({ params }) {
		// the `slug` parameter is available because
		// this file is called [slug].svelte
		const res = await this.fetch(`history/${params.id}.json`);
		const data = await res.json();

		if (res.status === 200) {
			return { posts: data };
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<script>
	import {onMount} from "svelte";

	export let posts;

	let currentConverter = '';

	onMount(() => {
		currentConverter = localStorage.getItem('currentConverter');
	})
</script>

<style>
	.history-page>.title{padding: 40px 0;}
</style>

<svelte:head>
	<title>Tickets | ProfitFlow</title>
</svelte:head>

<div class="container history-page">
	<div class="title">
		<h2>Logs for {currentConverter}</h2>
	</div>

	<div class="container history-list">
		<table class="table">
			<thead>
			<tr>
				<th>Date</th>
				<th>Message</th>
				<th>Level</th>
			</tr>
			</thead>

			<tbody>
				{#each posts as item}
					<tr>
						<td>
							{new Date(item.createdAt).toLocaleDateString('default', {
								month: '2-digit',
								day: '2-digit',
								year: 'numeric'
							})}
						</td>
						<td>{item.message}</td>
						<td>{item.level}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
