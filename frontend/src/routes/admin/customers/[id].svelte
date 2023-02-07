<script context="module">
	export async function preload({ params }) {
		// the `slug` parameter is available because
		// this file is called [slug].svelte
		const res = await this.fetch(`/admin/customers/${params.id}.json`);
		const data = await res.json();

		const res1 = await this.fetch(`/admin/customers/all-converters.json`);
		const data1 = await res1.json();

		if (res.status === 200) {
			return { posts: data, converters: data1 };
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<script>
	import {onMount} from "svelte";

	export let posts;
	export let converters;

	let selectedConverter = 0;
	let errors = [];
	let currentCustomerName = '';

	onMount(() => {
		currentCustomerName = localStorage.getItem('currentCustomerName');
	})

	function setCurrentConverter(name){
		localStorage.setItem('currentConverter', name);
	}

	async function assignConverter(){
		if(selectedConverter){
			let currentCustomerId = localStorage.getItem('currentCustomerId');

			const response = await fetch("/converter/" + selectedConverter + ".json", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					user_id: currentCustomerId,
				}),
			});

			const parsed = await response.json();

			if(parsed.error){
				if(parsed.error.errors){
					errors = parsed.error.errors;
				}else{
					errors = [
						{
							msg: parsed.error.error
						}
					]
				}

			}else{
				location.reload();
			}
		}

		// Hide Modal
		let modal = new bootstrap.Modal('#assignModal');

		modal.hide();
	}

	$: console.log(selectedConverter);
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

		<div class="add-user">
			<button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#assignModal" id="btn-modal">
				Assign Converter
			</button>
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

<!-- The Modal -->
<div class="modal fade" id="assignModal">
	<div class="modal-dialog">
		<div class="modal-content">

			<!-- Modal Header -->
			<div class="modal-header">
				<h4 class="modal-title">Assign Converter</h4>
				<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
			</div>

			<!-- Modal body -->
			<div class="modal-body">
				<div class="">
					<label class="form-label">Converters: </label>

					<select class="form-select" bind:value={selectedConverter}>
						{#each converters as item}
							<option value="{item.id}">{!!item.name ? item.name : ''}[{!!item.serial_number ? item.serial_number : ''}]</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Modal footer -->
			<div class="modal-footer">
				<button type="button" class="btn btn-primary" on:click={assignConverter}>Assign</button>
				<button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cancel</button>
			</div>

		</div>
	</div>
</div>
