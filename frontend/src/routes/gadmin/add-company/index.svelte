<script context="module">
    export async function preload(page, session) {
        const { token, role } = session;

        const res = await this.fetch(`/admin/customers/all-converters.json`);
        const data = await res.json();

        if (token) {
            return {token, converterList: data};
        }else{
            return null;
        }
    }
</script>

<script>
    import {onMount} from "svelte";

    export let token;
    export let converterList;

    let errors = [];
    let name;
    let admin;
    let description;
    let converters = [];

    onMount(() => {
    });

    async function submitForm() {
        const response = await fetch("/gadmin/add-company", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                name,
                admin,
                description,
                converters: converters.join(',')
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
            location.href = '/gadmin/companies';
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
        <form method="post" on:submit|preventDefault={submitForm}>
            <div class="form-group">
                <label class="form-label" for="name">Company Name: </label>
                <input type="text" id="name" name="name" class="form-control" required bind:value={name}>
            </div>
            <div class="form-group">
                <label class="form-label" for="admin">Administrator: </label>
                <input type="email" id="admin" name="admin" class="form-control" required bind:value={admin}>
            </div>
            <div class="form-group">
                <label class="form-label" for="converters">Converters: </label>
                <select class="form-select" multiple id="converters" name="converters" bind:value={converters}>
                    {#each converterList as item}
                        <option value="{item.id}">{item.name}[{item.serial_number}]</option>
                    {/each}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="additional">Additional: </label>
                <textarea id="additional" rows="4" class="form-control" required bind:value={description}></textarea>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" type="submit">Save</button>
            </div>
        </form>
    </div>
</div>
