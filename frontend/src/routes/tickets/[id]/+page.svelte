<script>
	import { enhance } from '$app/forms';
	import {getContext} from 'svelte';
	import ListErrors from '$lib/ListErrors.svelte';

	/** @type {import('./$types').ActionData} */
	export let form;

</script>

<svelte:head>
	<title>History • ProfitFlow</title>
</svelte:head>

<div class="container history-page">
	<div class="title">
		<h2>Tickets For Converter 1</h2>
	</div>

	<div class="container history-list">
		<table class="table">
			<thead>
			<tr>
				<th></th>
				<th>Date</th>
				<th>Problem</th>
				<th>Level</th>
			</tr>
			</thead>

			<tbody>
			<tr>
				<td>Ticket209</td>
				<td>01-12-2022</td>
				<td>Lorem imsum</td>
				<td>Warning</td>
			</tr>
			<tr>
				<td>Ticket209</td>
				<td>01-12-2022</td>
				<td>Lorem imsum</td>
				<td>Information</td>
			</tr>
			<tr>
				<td>Ticket209</td>
				<td>01-12-2022</td>
				<td>Lorem imsum</td>
				<td>Information</td>
			</tr>
			</tbody>
		</table>
	</div>
</div>

<style>
	.history-page>.title{padding: 40px 0;}

</style>
