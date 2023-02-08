<script context="module">
	export async function preload(page, session) {
		return this.fetch(`profile.json`).then(r => r.json()).then(user => {
			return { user };
		});
    }
</script>

<script>
    import axios from "axios";

	export let user;

	let password;
	let password_check;
	let firstName = !!user.first_name ? user.first_name : '';
	let lastName = !!user.last_name ? user.last_name : '';
	let email = !!user.email ? user.email : '';

	let errors = [];

	async function handleSubmit(event){
		const formData = new FormData(event.target);

		try {
			await axios.post('/settings', {
				first_name: firstName,
				last_name: lastName,
				email,
				password
			})
					.then(response => {
						// handle success
						// console.log(response.data)

						location.href = '/profile';
					})
					.catch(error => {
						if(error.response.data.error){
							errors = [
								{msg: error.response.data.error}
							];
						}else{
							errors = error.response.data.errors;
						}
					});

		} catch (error) {
			console.error(error);
		}
	}
</script>

<style>
</style>

<svelte:head>
    <title>Settings | ProfitFlow</title>
</svelte:head>

<div class="settings-page">
    <div class="container page">
        <div class="row">
            <div class="col-md-6 offset-md-3 col-xs-12 py-4">
                <h1 class="text-xs-center">Your Settings:</h1>

                <form method="POST" on:submit|preventDefault={handleSubmit}>

					<fieldset class="form-group mb-3">
						<label class="form-label">First Name:</label>
						<input
							class="form-control form-control-lg"
							name="first_name"
							type="text"
							placeholder="Enter first name" required
							bind:value={firstName}
						/>
					</fieldset>
					<fieldset class="form-group mb-3">
						<label class="form-label">Last Name:</label>
						<input
							class="form-control form-control-lg"
							name="last_name"
							type="text"
							placeholder="Enter last name" required
							bind:value={lastName}
						/>
					</fieldset>

					<fieldset class="form-group mb-3">
						<label class="form-label">Email:</label>
						<input
							class="form-control form-control-lg"
							name="email"
							type="email"
							placeholder="Enter email" required
							bind:value={email}
						/>
					</fieldset>

					<fieldset class="form-group mb-3">
						<label class="form-label">Password:</label>
						<input
							class="form-control form-control-lg"
							name="password"
							type="password"
							placeholder="New Password" style="margin-bottom: 10px;" required
							bind:value={password}
						/>
						<input
							class="form-control form-control-lg"
							type="password"
							placeholder="Confirm Password"
							bind:value={password_check} required
						/>
					</fieldset>

					<div class="mb-3">
						<label class="form-label">  </label>
						<div class="d-flex">
							{#if !password || password === password_check}

							{:else }
								<p class="text-danger">Password is incorrect!</p>
							{/if}

							{#if errors.length > 0}
								{#each errors as item}
									<div><i class="fas fa-circle"></i></div>
									<div>{item.msg}</div>
								{/each}
							{/if}
						</div>
					</div>

					<button class="btn btn-lg btn-primary pull-xs-right">Save Settings</button>
				</form>
			</div>
		</div>
	</div>
</div>
