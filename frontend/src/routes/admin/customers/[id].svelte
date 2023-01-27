<script context="module">
	export async function preload({ params }) {
		// the `slug` parameter is available because
		// this file is called [slug].svelte
		const res = await this.fetch(`/admin/customers/${params.id}.json`);
		const data = await res.json();

		if (res.status === 200) {
			return { post: data };
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<script>
	export let post;
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
	<title>Converters | ProfitFLow</title>
</svelte:head>

<div class="home-page">
	<div class="search-bar container">
		<div>
			<h2>User 1</h2>
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
						<th>Status</th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
					</tr>
					</thead>
					<tbody>
						<tr>
							<td><a href="/converter/1" target="_blank">Converter 1</a></td>
							<td class="status center"><i class="fas fa-circle"></i></td>
							<td class="center"><a href="/tickets/1">View Tickets</a></td>
							<td class="center"><a href="/history/1">View History</a></td>
							<td class="center"><a href="/tickets/1"><i class="fas fa-edit"></i></a></td>
							<td class="center"><a href="/history/1"><i class="fas fa-trash-alt"></i></a></td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
