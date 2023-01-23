<script>
	import { enhance } from '$app/forms';
	import ListErrors from '$lib/ListErrors.svelte';

	/** @type {import('./$types').ActionData} */
	export let form;
</script>

<svelte:head>
	<title>Register • ProfitFlow</title>
</svelte:head>

<div class="auth-page container-fluid">
	<div class="row">
		<div class="col-xs-7">
			<div>
				<h1>Welcome to ProfitFlow</h1>
			</div>
			<div>
				<p>Lorem imsum dolor sit amet
					Lorem imsum dolor sit amet
					Lorem imsum dolor sit amet
					Lorem imsum dolor sit amet
					Lorem imsum dolor sit amet
					Lorem imsum dolor sit amet
					Lorem imsum dolor sit amet
					Lorem imsum dolor sit amet

			</div>
		</div>

		<div class="spliter"></div>

		<div class="">
			<div class="">
				<div class="">
					<h1 class="text-xs-center">Register</h1>
				</div>

				<ListErrors errors={form?.errors} />

				<form use:enhance method="POST">
					<fieldset class="form-group">
						<label>First Name: </label>
						<input class="form-control form-control-lg" name="first_name" type="text" required placeholder="" />
					</fieldset>
					<fieldset class="form-group">
						<label>Last Name: </label>
						<input class="form-control form-control-lg" name="last_name" type="text" required placeholder="" />
					</fieldset>
					<fieldset class="form-group">
						<label>Title: </label>
						<select class="form-control" name="title">
							<option value="1">Option 1</option>
							<option value="2">Option 2</option>
							<option value="3">Option 3</option>
						</select>
					</fieldset>
					<fieldset class="form-group">
						<label>Email: </label>
						<input
								class="form-control form-control-lg"
								name="email"
								type="email"
								required
								placeholder="Email"
						/>
					</fieldset>
					<fieldset class="form-group">
						<label>Phone Number: </label>
						<input class="form-control form-control-lg" name="phone_number" type="text" required placeholder="" />
					</fieldset>
					<fieldset class="form-group">
						<label>Password: </label>
						<input
								class="form-control form-control-lg"
								name="password"
								type="password"
								required
								placeholder="Password"
						/>
					</fieldset>
					<fieldset class="form-group">
						<label>Repeat Password: </label>
						<input
								class="form-control form-control-lg"
								type="password"
								required
								placeholder="Password"
						/>
					</fieldset>

					<div class="btn-group">
						<button class="btn btn-lg btn-primary pull-xs-right" type="submit">Submit</button>
					</div>

				</form>
			</div>
		</div>
	</div>

</div>

<style>
	div.auth-page>div.row>div.spliter{
		width: 1px;
		padding: 0;
		background: #333;
	}
	div.auth-page>div.row>div{padding: 40px 100px;}
	div.auth-page>div.row>div:nth-child(1)>div:nth-child(1){margin-bottom: 40px;}
	div.auth-page>div.row>div:nth-child(1)>div:nth-child(2){font-size: 20px;}
	div.auth-page>div.row>div:nth-child(3)>div>div:nth-child(1){margin-bottom: 40px}
	div.auth-page>div.row>div:nth-child(3){flex-grow: 1;}
	div.auth-page>div.row>div:nth-child(3)>div>div:nth-child(1){}
	div.auth-page>div.row>div:nth-child(3) div.btn-group{
		display: flex;
		justify-content: center;
		margin-top: 40px;
		margin-bottom: 10px;
	}
	div.auth-page>div.row>div:nth-child(3) div.btn-group>button{
		background-color: #333;
		border-color: #333;
		width: 150px;
	}

	div.auth-page>div.row>div:nth-child(3) form fieldset{}
	div.auth-page>div.row>div:nth-child(3) form fieldset>label{}
	div.auth-page>div.row>div:nth-child(3) form fieldset>input{}
</style>
