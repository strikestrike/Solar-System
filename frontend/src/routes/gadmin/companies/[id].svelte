<script context="module">
	export async function preload({ params }) {
		// the `slug` parameter is available because
		// this file is called [slug].svelte
		const res = await this.fetch(`/gadmin/companies/${params.id}.json`);
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
	import Modal from "../../../components/Modal.svelte";
	import Toast from "../../../components/Toast.svelte";
	import axios from "axios";

	export let posts;

	let currentCustomerName = '';
	let showModal;
	let showConfirm = false;
	let confirmText;
	let confirmModal;
	let toastBody;

	onMount(() => {
		currentCustomerName = localStorage.getItem('currentCustomerName');
	})


	function clickDeleteCustomer(id){
		confirmText = 'Are you sure you want to delete this customer?';

		localStorage.setItem('currentCustomerId', id);

		controlConfirm();
	}

	function controlConfirm(){
		// document.getElementById("btn-confirm-modal").click();
		confirmModal = new bootstrap.Modal('#myModal');

		confirmModal.show();
	}

	function setCurrentCustomer(name){
		localStorage.setItem('currentCustomerName', name);
	}

	function deleteAction(){
		let id = localStorage.getItem('currentCustomerId');

		confirmModal.hide();

		const {BACKEND_HOST} = process.env;
		axios.delete(BACKEND_HOST + '/api/users/' + id)
				.then(response => {
					// handle success
					// console.log(response.data)
					console.log(response.data);

					toastBody = "Deleted successfully!";
					showToast();
				})
				.catch(error => {
					console.log(error);

					toastBody = "Error happened!";
					showToast();
				});
	}

	function showToast(){
		const toastLiveExample = document.getElementById('liveToast')
		const toast = new bootstrap.Toast(toastLiveExample, {
			// delay: 3000,
			animation: true,
			autohide: false,
		})

		toast.show();
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

<Modal {confirmText} confirmYesEvent={deleteAction} />
<Toast {toastBody} />

<div class="home-page">
	<div class="search-bar container">
		<div>
			<h2>{currentCustomerName}</h2>
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
							<th class="center">Edit</th>
							<th class="center">Delete</th>
						</tr>
					</thead>
					<tbody>
						{#each posts as item}
							<tr>
								<td><a on:click={() => setCurrentCustomer(item.first_name + ' ' + item.last_name)} href="/admin/customers/{item.id}">{item.first_name + ' ' + item.last_name}</a></td>
								<td class="center"><a href="/admin/edit-user/{item.id}"><i class="fas fa-edit"></i></a></td>
								<td class="center"><span class="link" on:click={() => clickDeleteCustomer(item.id)}><i class="fas fa-trash-alt"></i></span></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
