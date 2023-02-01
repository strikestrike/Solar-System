<script context="module">
	export function preload({ query }) {
		let url = '/gadmin/companies.json?';

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
	import Modal from "../../../components/Modal.svelte";
	import Toast from "../../../components/Toast.svelte";
	import axios from "axios";

	export let posts;

	let toastBody;

	let showModal;
	let showConfirm = false;
	let confirmText;
	let confirmModal;
	let searchQuery = '';

	onMount(async () => {
		searchQuery = localStorage.getItem("searchQuery") || "";

	});

	const handleSubmit = () => {
		localStorage.setItem("searchQuery", searchQuery);
		location.href = location.pathname + `?q=${searchQuery}`;
	};

	const inputKeypressEvent = (e) => {
		if(e.keyCode === 13){
			handleSubmit();
		}
	}

	function setCurrentConverter(name){
		localStorage.setItem('currentConverter', name);
	}

	function controlConfirm(){
		// document.getElementById("btn-confirm-modal").click();
		confirmModal = new bootstrap.Modal('#myModal');

		confirmModal.show();
	}

	function clickDeleteCustomer(id){
		confirmText = 'Are you sure you want to delete this company?';

		localStorage.setItem('currentCustomerId', id);

		controlConfirm();
	}

	function deleteAction(){
		let id = localStorage.getItem('currentCustomerId');

		confirmModal.hide();

		axios.delete('http://localhost:8080/api/companies/' + id)
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
</script>

<svelte:head>
	<title>Companies | ProfitFLow</title>
</svelte:head>

<Modal {confirmText} confirmYesEvent={deleteAction} />
<Toast {toastBody} />

<div class="home-page">
	<div class="search-bar container d-flex justify-content-between">
		<div>
			<h1>Companies</h1>
		</div>

		<div style="flex-grow: 1;"></div>

		<div class="add-user">
			<a href="/gadmin/add-company"><i class="fas fa-plus"></i></a>
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
						<th class="center">Edit</th>
						<th class="center">Delete</th>
					</tr>
					</thead>
					<tbody>
						{#each posts as item}
							<tr>
								<td><a href="/gadmin/companies/{item.id}" target="_blank">{item.name}</a></td>
								<td class="center"><a class="text-body" href="/admin/edit-user/{item.id}"><i class="fas fa-edit"></i></a></td>
								<td class="center"><span class="link" on:click={() => clickDeleteCustomer(item.id)}><i class="fas fa-trash-alt"></i></span></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>



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

	div.add-user{margin-right: 40px;}
	div.add-user>a{
		display: flex;
		align-items: center;
		font-size: 20px;
		color: #333;
	}
	div.add-user>a:hover{text-decoration: none;}

	/**/
	.converter-list .item>.title>a{color: #333;}
	td.status>i{color: #878787;}
	td.status>i.green{color: #17d632;}
</style>
