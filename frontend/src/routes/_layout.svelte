<script context="module">
	export async function preload(page, session) {
		const { token, role } = session;

		if (token) {
			return {isLogin: true, role: role};
		}else{
			return {isLogin: false, role: ''};
		}
	}
</script>

<script>
	import Nav from '../components/Nav.svelte';
	import Footer from "../components/Footer.svelte";

	export let isLogin = false;
	export let role = '';
	export let segment;
</script>

<style>
	main{min-height: calc(100vh - 260px);}
</style>

<Nav {segment} {isLogin} {role} />

<main>
	<slot></slot>
</main>

<Footer />
