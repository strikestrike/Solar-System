<script context="module">
    export async function preload(page, session) {
        // the `slug` parameter is available because
        // this file is called [slug].svelte
        const res = await this.fetch(`/user/${page.params.id}.json`);
        const data = await res.json();

        if (res.status === 200) {
            return { post: data, role: session.role };
        } else {
            this.error(res.status, data.message);
        }
    }
</script>

<script>
    export let post;
    export let role;

    let errors = [];
    let firstName = post.first_name;
    let lastName = post.last_name;
    let email = post.email;
    let birthday = post.birthday;
    let address = post.address;
    let additional = post.additional;

    async function submitForm() {
        const response = await fetch("/admin/edit-user/" + post.id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email,
                birthday,
                address,
                additional,
                company_id: post.company_id,
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
            if(role == 2){
                location.href = '/gadmin/companies/' + post.company_id;
            }else{
                location.href = '/admin/customers';
            }
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
        <h1>Edit User</h1>
    </div>

    <div class="form-container">
        <form method="post" on:submit|preventDefault={submitForm}>
            <div class="form-group">
                <label class="form-label" for="first-name">First Name: </label>
                <input type="text" id="first-name" name="first_name" class="form-control" required bind:value={firstName}>
            </div>
            <div class="form-group">
                <label class="form-label" for="last-name">Last Name: </label>
                <input type="text" id="last-name" name="last_name" class="form-control" required bind:value={lastName}>
            </div>
            <div class="form-group">
                <label class="form-label" for="email">Email: </label>
                <input type="email" id="email" name="email" class="form-control" required bind:value={email}>
            </div>
            <div class="form-group">
                <label class="form-label" for="birthday">Birthday: </label>
                <input type="date" id="birthday" name="birthday" class="form-control" required bind:value={birthday}>
            </div>
            <div class="form-group">
                <label class="form-label" for="address">Address: </label>
                <input type="text" id="address" name="address" class="form-control" required bind:value={address}>
            </div>
            <div class="form-group">
                <label class="form-label" for="additional">Additional: </label>
                <textarea id="additional" rows="4" class="form-control" required bind:value={additional}></textarea>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" type="submit">Save</button>
            </div>
        </form>
    </div>
</div>
