<script>
	import { enhance } from '$app/forms';
	import ListErrors from '$lib/ListErrors.svelte';

	/** @type {import('./$types').ActionData} */
	export let form;
</script>

<svelte:head>
	<title>Converter • ProfitFlow</title>
</svelte:head>

<div class="container converter-page">
	<div class="row">
		<div class="photo col-xs-4">
			<img src="/converter.png" alt="Converter Image">
		</div>
		<div class="description col-xs-8">
			<p>Lorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscing
			<p>Lorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscing
			<p>Lorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscing
			<p>Lorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscing
			<p>Lorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscing
			<p>Lorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscing
			<p>Lorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscing
			<p>Lorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscingLorem imsum dolor sit amet, consectetur adipiscing
		</div>
	</div>
</div>

<style>
	.converter-page{padding: 40px 100px;}
	.converter-page .photo img{width: 100%;}
	.converter-page .description{padding-left: 40px;}
</style>
