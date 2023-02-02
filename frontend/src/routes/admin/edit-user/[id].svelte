<script context="module">
    export async function preload({ params }) {
        // the `slug` parameter is available because
        // this file is called [slug].svelte
        const res = await this.fetch(`/user/${params.id}.json`);
        const data = await res.json();

        if (res.status === 200) {
            return { post: data };
        } else {
            this.error(res.status, data.message);
        }
    }
</script>

<script>
    import axios from "axios";

    export let post;

    let errors = [];

    async function submitForm(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const {BACKEND_HOST} = process.env;
            await axios.put(BACKEND_HOST + '/api/users/' + post.id, formData)
                .then(response => {
                    // handle success
                    console.log(response.data)

                    location.href = '/admin/customers';
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
        <h1>Edit User</h1>
    </div>

    <div class="form-container">
        <form method="post" on:submit={submitForm}>
            <div class="form-group">
                <label class="form-label" for="first-name">First Name: </label>
                <input type="text" id="first-name" name="first_name" class="form-control" required value={post.first_name}>
            </div>
            <div class="form-group">
                <label class="form-label" for="last-name">Last Name: </label>
                <input type="text" id="last-name" name="last_name" class="form-control" required value="{post.last_name}">
            </div>
            <div class="form-group">
                <label class="form-label" for="email">Email: </label>
                <input type="email" id="email" name="email" class="form-control" required value="{post.email}">
            </div>
            <div class="form-group">
                <label class="form-label" for="birthday">Birthday: </label>
                <input type="date" id="birthday" name="birthday" class="form-control" required value="{post.birthday}">
            </div>
            <div class="form-group">
                <label class="form-label" for="address">Address: </label>
                <input type="text" id="address" name="address" class="form-control" required value="{post.address}">
            </div>
            <div class="form-group">
                <label class="form-label" for="additional">Additional: </label>
                <textarea id="additional" rows="4" class="form-control" required value="{post.additional}"></textarea>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" type="submit">Save</button>
            </div>
        </form>
    </div>
</div>
