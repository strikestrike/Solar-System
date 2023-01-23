<script>
	import { page } from '$app/stores';
	import ArticleList from '$lib/ArticleList/index.svelte';
	import Pagination from './Pagination.svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	$: p = +($page.url.searchParams.get('page') ?? '1');
	$: tag = $page.url.searchParams.get('tag');
	$: tab = $page.url.searchParams.get('tab') ?? 'all';
	$: page_link_base = tag ? `tag=${tag}` : `tab=${tab}`;
</script>

<svelte:head>
	<title>ProfitFlow</title>
</svelte:head>

<div class="home-page">
	{#if !data.user}
		<div class="banner">
			<div class="container">
				<h1 class="logo-font">ProfitFlow</h1>
				<p>A place to share your knowledge.</p>
			</div>
		</div>
	{/if}

	<div class="search-bar container">
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
<!--				<div class="feed-toggle">-->
<!--					<ul class="nav nav-pills outline-active">-->
<!--						<li class="nav-item">-->
<!--							<a href="/?tab=all" class="nav-link" class:active={tab === 'all' && !tag}>-->
<!--								Global Feed-->
<!--							</a>-->
<!--						</li>-->

<!--						{#if data.user}-->
<!--							<li class="nav-item">-->
<!--								<a href="/?tab=feed" class="nav-link" class:active={tab === 'feed'}>Your Feed</a>-->
<!--							</li>-->
<!--						{:else}-->
<!--							<li class="nav-item">-->
<!--								<a href="/login" class="nav-link">Sign in to see your Feed</a>-->
<!--							</li>-->
<!--						{/if}-->

<!--						{#if tag}-->
<!--							<li class="nav-item">-->
<!--								<a href="/?tag={tag}" class="nav-link active">-->
<!--									<i class="ion-pound" />-->
<!--									{tag}-->
<!--								</a>-->
<!--							</li>-->
<!--						{/if}-->
<!--					</ul>-->
<!--				</div>-->

<!--				<ArticleList articles={data.articles} />-->
<!--				<Pagination pages={data.pages} {p} href={(p) => `/?${page_link_base}&page=${p}`} />-->

				<div class="item">
					<div class="title">
						<a href="/converter" target="_blank">Converter 1</a>
					</div>
					<div class="status"><i class="fas fa-circle"></i></div>

					<div class="flex-grow-1"></div>

					<div class="view-ticket">
						<a href="/tickets/1">View Tickets</a>
					</div>
					<div class="view-history">
						<a href="/history/1">View History</a>
					</div>
				</div>
				<div class="item">
					<div class="title">
						<a href="/converter" target="_blank">Converter 2</a>
					</div>
					<div class="status"><i class="fas fa-circle"></i></div>

					<div class="flex-grow-1"></div>

					<div class="view-ticket">
						<a href="/tickets/1">View Tickets</a>
					</div>
					<div class="view-history">
						<a href="/history/1">View History</a>
					</div>
				</div>
				<div class="item">
					<div class="title">
						<a href="/converter" target="_blank">Converter 3</a>
					</div>
					<div class="status"><i class="fas fa-circle"></i></div>

					<div class="flex-grow-1"></div>

					<div class="view-ticket">
						<a href="/tickets/1">View Tickets</a>
					</div>
					<div class="view-history">
						<a href="/history/1">View History</a>
					</div>
				</div>
			</div>

<!--			<div class="col-md-3">-->
<!--				<div class="sidebar">-->
<!--					<p>Popular Tags</p>-->
<!--					<div class="tag-list">-->
<!--						{#each data.tags as tag}-->
<!--							<a href="/?tag={tag}" class="tag-default tag-pill">{tag}</a>-->
<!--						{/each}-->
<!--					</div>-->
<!--				</div>-->
<!--			</div>-->
		</div>
	</div>
</div>

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
	}
	div.search-bar>div{display: flex;justify-content: flex-end;}
	div.search-bar label{
		margin-bottom: 0;
		display: flex;
		align-items: center;
	}
	div.search-bar input{width: 300px;}

	/**/
	.flex-grow-1{flex-grow: 1;}

	/**/
	.converter-list .item{display: flex;margin-bottom: 40px;}
	.converter-list .item>.title{
		font-size: 20px;
		margin-right: 20px;
	}
	.converter-list .item>.title>a{color: #333;}
	.converter-list .item>.status{
		display: flex;
		align-items: center;
	}
	.converter-list .item>.status>i{color: #17d632;}
	.converter-list .item>.view-ticket{margin-right: 40px;}
	.converter-list .item>.view-history{}

	/**/
</style>
