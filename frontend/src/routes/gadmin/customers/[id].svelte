<script context="module">
	export async function preload(page, session) {
		// the `slug` parameter is available because
		// this file is called [slug].svelte
		const res = await this.fetch(`/gadmin/customers/${page.params.id}.json`);
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

	let selectedConverter = 0;
	let errors = [];
	let currentCustomerName = '';

	onMount(() => {
		currentCustomerName = localStorage.getItem('currentCustomerName');
	})

	function setCurrentConverter(name){
		localStorage.setItem('currentConverter', name);
	}
</script>

<style>
	#svg-user-search{
		height: 28px;
		margin-right: 10px;
	}

	div.home-page>div.container{
	}

	div.search-bar{
		padding: 60px 0 10px 0;
		border-bottom: 1px #e5e5e5 solid;
		display: flex;
		justify-content: space-between;
	}
	div.search-bar>div{display: flex;justify-content: flex-end;}
	div.search-bar label{
		margin-bottom: 0;
		display: flex;
		align-items: center;
	}
	div.search-bar input{width: 300px;}

	/**/
	.converter-list .item>.title>a{color: #333;}
	td.status>i{color: #17d632;}
	th.center, td.center{text-align: center;}

	td a{
		color: #333;
	}

	div.add-user{margin-right: 40px;}
	div.add-user>a{
		display: flex;
		align-items: center;
		font-size: 20px;
		color: #333;
	}
	div.add-user>a:hover{text-decoration: none;}
</style>

<svelte:head>
	<title>Converters | ProfitFLow</title>
</svelte:head>

<div class="home-page">
	<div class="search-bar container">
		<div>
			<h2>{currentCustomerName}</h2>
		</div>

		<div style="flex-grow: 1;"></div>
	</div>

	<div class="container page">
		<div class="row">
			<div class="col-md-12 converter-list">
				<table class="table">
					<thead>
					<tr>
						<th>Name</th>
						<th>Expected Throughput</th>
						<th>Vendor</th>
						<th class="center">Active</th>
						<th class="center">Tickets</th>
						<th class="center">Logs</th>
					</tr>
					</thead>
					<tbody>
						{#each posts as item}
							<tr>
								<td><a href="/converter/{item.id}" target="_blank" on:click={() => setCurrentConverter(item.name)}>
									{!!item.name ? item.name : ''}[{!!item.serial_number ? item.serial_number : ''}]
								</a></td>
								<td>{!!item.expected_throughput ? item.expected_throughput : ''}</td>
								<td>{!!item.vendor ? item.vendor : ''}</td>

								{#if item.status == 'Ok'}
									<td class="status center"><i class="fas fa-circle green"></i></td>
								{:else}
									<td class="status center"><i class="fas fa-circle"></i></td>
								{/if}
								<td class="center"><a href="/tickets/{item.id}" on:click={() => setCurrentConverter(item.name)}>View</a></td>
								<td class="center"><a href="/history/{item.id}" on:click={() => setCurrentConverter(item.name)}>View</a></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
