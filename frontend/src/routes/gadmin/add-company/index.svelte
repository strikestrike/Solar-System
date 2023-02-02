<script context="module">
    export async function preload(page, session) {
        const { token, role } = session;

        if (token) {
            return {token};
        }else{
            return null;
        }
    }
</script>

<script>
    import axios from "axios";
    import {onMount} from "svelte";

    export let token;

    let errors = [];

    onMount(() => {
        const select = document.querySelector("select");
        select.vanillaSelect();
    });

    async function submitForm(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        formData.set('company_id', token.company_id);

        try {
            const {BACKEND_HOST} = process.env;
            await axios.post(BACKEND_HOST + '/api/companies', formData)
                .then(response => {
                    // handle success
                    console.log(response.data)

                    location.href = '/gadmin/companies';
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
    div.add-user{padding: 40px 100px;}
    div.add-user>div.title{margin-bottom: 40px;}
    textarea{resize: vertical;}
    div.form-group{margin-bottom: 20px;}

</style>

<div class="container add-user">

    {#if errors.length > 0}
        <div id="error-container" class="text-danger">
            {#each errors as item}
                <div>
                    <div><i class="fas fa-circle"></i></div>
                    <div>{item.msg}</div>
                </div>
            {/each}
        </div>
    {/if}

    <div class="title">
        <h1>Add Company</h1>
    </div>

    <div class="form-container">
        <form method="post" on:submit={submitForm}>
            <div class="form-group">
                <label class="form-label" for="name">Company Name: </label>
                <input type="text" id="name" name="name" class="form-control" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="admin">Administrator: </label>
                <input type="email" id="admin" name="admin" class="form-control" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="converters">Converters: </label>
                <select class="form-control" multiple id="converters" name="converters">
                    <option></option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="additional">Additional: </label>
                <textarea id="additional" rows="4" class="form-control" required></textarea>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" type="submit">Save</button>
            </div>
        </form>
    </div>
</div>
