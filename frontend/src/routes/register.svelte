<script>
    import axios from "axios";
    import Toast from "../components/Toast.svelte";

    let password = "";
    let passwordCheck = "";
    let showPassword = false;
    let toastBody = '';
    let error;

    async function handleRegister(event) {
        const formData = new FormData(event.target);

        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                first_name: formData.get("first_name"),
                last_name: formData.get("last_name"),
                email: formData.get("email"),
                phone: formData.get("phone"),
                password,
                address: formData.get("address"),
            }),
        });

        const parsed = await response.json();

        if (parsed.error) {
            error = parsed.error;
        } else {
            showToast('Register is successful');
            setTimeout(function(){location.href = '/login';}, 3000);
        }

    }

    function changePasswordInputType(){
        showPassword = !showPassword;
    }

    function showToast(text){
        const toastLiveExample = document.getElementById('liveToast')
        const toast = new bootstrap.Toast(toastLiveExample, {
            // delay: 3000,
            animation: true,
            autohide: false,
        });

        toastBody = text;

        toast.show();
    }

</script>

<svelte:head>
    <title>Register • ProfitFlow</title>
</svelte:head>

<Toast {toastBody} />

<div class="auth-page container-fluid">
    <div class="row">
        <div class="col-7">
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

                <form on:submit|preventDefault="{handleRegister}" method="post">
                    <fieldset class="form-group mb-3">
                        <label class="form-label">
                            First Name:
                        </label>
                        <input
                                class="form-control "
                                name="first_name"
                                type="text"
                                required
                                placeholder="Enter first name"
                        />
                    </fieldset>
                    <fieldset class="form-group mb-3">
                        <label class="form-label">
                            Last Name:
                        </label>
                        <input
                                class="form-control "
                                name="last_name"
                                type="text"
                                required
                                placeholder="Enter last name"
                        />
                    </fieldset>

                    <fieldset class="mb-3">
                        <label class="form-label">Address:</label>
                        <input type="text" name="address" id="address" required placeholder="Enter your address" class="form-control ">
                    </fieldset>

                    <fieldset class="mb-3">
                        <label class="form-label">Phone Number:</label>
                        <input type="text" name="phone" id="phone" required placeholder="Enter phone number" class="form-control ">
                    </fieldset>

                    <fieldset class="mb-3">
                        <label class="form-label">Email:</label>
                        <input type="email" name="email" id="email" required placeholder="Enter your email" class="form-control ">
                    </fieldset>

                    <fieldset class="form-group mb-3" style="position: relative;">
                        <label class="form-label">Password: </label>
                        <input
                                class={showPassword ? "d-none" : "form-control"}
                                name="password"
                                type="password"
                                required
                                placeholder="Enter password"
                                id="password" bind:value={password}
                        />
                        <input
                                class={showPassword ? "form-control" : "d-none"}
                                name="password"
                                type="text"
                                required
                                placeholder="Enter password"
                                bind:value={password}
                        />
                        <a type="button" class="btn btn-default show-password" on:click={changePasswordInputType}>
                            {#if showPassword}
                                <i class="fas fa-times"></i>
                            {:else}
                                Show
                            {/if}
                        </a>
                    </fieldset>

                    <fieldset class="form-group mb-3">
                        <label class="form-label">Repeat Password: </label>
                        <input
                                class="form-control "
                                type="password"
                                required
                                placeholder="Enter password again"
                                id="password_repeat" bind:value={passwordCheck}
                        />
                    </fieldset>

                    {#if password !== passwordCheck}
                        <div class="text-danger">
                            <i class="fas fa-exclamation-circle"></i>
                            Passwords do not match
                        </div>
                    {/if}

                    {#if password && password === passwordCheck}
                        <div class="text-success">
                            <i class="fas fa-check"></i>
                            Passwords is correct
                        </div>
                    {/if}

                    {#if error}
                    <fieldset class="form-group">
                        <label class="form-label"></label>

                        <div>
                            <p class="error-messages">{error}</p>
                        </div>

                    </fieldset>
                    {/if}

                    <div class="btn-group">
                        <button class="btn btn-lg btn-primary pull-xs-right" type="submit" disabled={!password || password !== passwordCheck}>Register</button>
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
    div.auth-page>div.row>div:nth-child(3){flex: 1;}
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

    a.show-password{
        position: absolute;
        right: 0;
        bottom: 0;
        width: 70px;
    }
    a.show-password:active{
        border: none;
    }

</style>
