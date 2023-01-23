<script>
    export let data;
</script>

<div class="side-bar">
    <div>ProfitFlow</div>

    <div>
        <div>
            <a href="/profile/{data.profile.username}">
                <i></i>
                Profile
            </a>
        </div>
        <div>
            <a href="/settings/{data.profile.username}">
                <i></i>
                Setting
            </a>

        </div>

        <div class="flex-grow-1"></div>

        <div>
            <a href="/logout">
                <i></i>
                Logout
            </a>
        </div>
    </div>
</div>

<style>
    div.side-bar{
        width: 300px;
    }
</style>
