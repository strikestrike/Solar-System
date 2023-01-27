<script></script>

<style>
    div.add-user{padding: 40px 100px;}
    div.add-user>div.title{margin-bottom: 40px;}
    textarea{resize: vertical;}
</style>

<div class="container add-user">
    <div class="title">
        <h1>Create New User</h1>
    </div>

    <div class="form-container">
        <form method="post">
            <div class="form-group">
                <label for="name">Name: </label>
                <input type="text" id="name" name="name" class="form-control">
            </div>
            <div class="form-group">
                <label for="email">Email: </label>
                <input type="email" id="email" name="email" class="form-control">
            </div>
            <div class="form-group">
                <label for="birthday">Birthday: </label>
                <input type="date" id="birthday" name="birthday" class="form-control">
            </div>
            <div class="form-group">
                <label for="address">Address: </label>
                <input type="text" id="address" name="address" class="form-control">
            </div>
            <div class="form-group">
                <label for="additional">Additional: </label>
                <textarea id="additional" rows="4" class="form-control"></textarea>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" type="button">Save</button>
            </div>
        </form>
    </div>
</div>
