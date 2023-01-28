<script context="module">
	export function preload() {
		return this.fetch(`/admin/customers.json`).then(r => r.json()).then(posts => {
			return { posts };
		});
	}
</script>

<script>
	import {onMount} from 'svelte';
	import Modal from "../../../components/Modal.svelte";

	export let posts;

	let showModal;
	let showConfirm = false;
	let confirmText;
	let confirmOkText;

	onMount(() => {

	});

	function clickDeleteCustomer(){
		showConfirm = true;

		confirmText = 'Are you sure you want to delete this customer?';
		confirmOkText = 'Yes';
	}

</script>

<style>
	#svg-user-search{
		height: 28px;
		margin-right: 10px;
	}

	div.home-page>div.container{
		margin-top: 40px;
	}

	div.search-bar{
		padding: 20px 0 10px 0;
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
	<title>Customers | ProfitFLow</title>
</svelte:head>

<Modal {showConfirm}  />

<div class="home-page">
	<div class="search-bar container">
		<div>
			<h2>My Customers</h2>
		</div>

		<div style="flex-grow: 1;"></div>

		<div class="add-user">
			<a href="/admin/add-user"><i class="fas fa-plus"></i></a>
		</div>
		<div>
			<label>
				<img src="/user-search.svg" alt="search user svg" id="svg-user-search">
			</label>

			<input class="form-control" type="text">
		</div>
	</div>

	<div class="container page">
		<div class="row">
			<div class="col-md-12 converter-list">
				<table class="table">
					<thead>
						<tr>
							<th>Name</th>
							<th></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each posts as item}
							<tr>
								<td><a href="/admin/customers/{item.id}">{item.title}</a></td>
								<td class="center"><a href="/tickets/{item.id}"><i class="fas fa-edit"></i></a></td>
								<td class="center"><span on:click={clickDeleteCustomer}><i class="fas fa-trash-alt"></i></span></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
