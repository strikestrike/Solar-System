<script>
	export let segment;
	export let isLogin;
	export let role;
</script>

<style>
	nav {
		border-bottom: 1px solid rgba(255,62,0,0.1);
		font-weight: 300;
		padding: 0 1em;
		height: 60px;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}

	[aria-current] {
		position: relative;
		display: inline-block;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: rgb(255,62,0);
		display: block;
		bottom: -1px;
	}

	nav a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
		color: #333;
	}

	nav a:hover{
		color: #5cb85c;
	}

	nav div.container-fluid{
		display: flex;
		justify-content: space-between;
	}
	nav div.container-fluid div.logo{display: flex;align-items: center;}
	nav div.container-fluid div.logo>a{margin: 0;padding: 0;}
</style>
<nav class="navbar navbar-light">
	<div class="container-fluid">
		<div class="logo">
			<a class="navbar-brand" href="/">ProfitFlow</a>
		</div>

		<ul class="nav pull-xs-right">
			{#if isLogin && role == 0}
				<li><a aria-current="{segment === 'converter' ? 'page' : undefined}" href="/converter">Converter</a></li>
			{/if}
			{#if isLogin && role == 1}
				<li><a href="/admin/customers">Customers</a></li>
				<li><a href="/admin/converters">Converters</a></li>
			{/if}

			{#if isLogin}
				<li><a rel=prefetch aria-current="{segment === 'profile' ? 'page' : undefined}" href="/profile">Profile</a></li>
				<li><a rel=prefetch aria-current="{segment === 'settings' ? 'page' : undefined}" href="/settings">Settings</a></li>
				<li><a rel=prefetch href="/logout">logout</a></li>
			{:else }
				<li><a rel=prefetch aria-current="{segment === 'login' ? 'page' : undefined}" href="/login">Login</a></li>
			{/if}

		</ul>
	</div>

</nav>
