<script context="module">
	export function preload({ query }) {
		let url = 'converter.json?';

		if(!!query.q){
			url += 'q=' + query.q;
		}

		return this.fetch(url).then(r => r.json()).then(posts => {
			return { posts };
		});
	}
</script>

<script>
	import {onMount} from 'svelte';

	export let posts;

	let searchQuery = '';

	onMount(async () => {
		searchQuery = localStorage.getItem("searchQuery") || "";

	});

	const handleSubmit = () => {
		localStorage.setItem("searchQuery", searchQuery);
		location.href = `converter?q=${searchQuery}`;
	};

	const inputKeypressEvent = (e) => {
		if(e.keyCode === 13){
			handleSubmit();
		}
	}

	function setCurrentConverter(name){
		localStorage.setItem('currentConverter', name);
	}
</script>

<svelte:head>
	<title>Converter | ProfitFLow</title>
</svelte:head>

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
	td.status>i{color: #878787;}
	td.status>i.green{color: #17d632;}
</style>

<div class="home-page">
	<div class="search-bar container d-flex justify-content-between">
		<div>
			<h1>Converters</h1>
		</div>
		<div>
			<label>
				<img src="/user-search.svg" alt="search user svg" id="svg-user-search">
			</label>

			<input class="form-control" type="text" bind:value={searchQuery} on:keypress={inputKeypressEvent} id="input-search">
		</div>
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
									{!!item.name ? item.name : ''}({!!item.serial_number ? item.serial_number : ''})
								</a></td>
								<td>{!!item.expected_throughput ? item.expected_throughput : ''}</td>
								<td>{!!item.vendor ? item.vendor : ''}</td>

								{#if item.status == 'ok'}
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

