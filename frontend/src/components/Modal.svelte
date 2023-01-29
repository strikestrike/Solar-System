<script>
    import {onMount} from 'svelte';

    export let confirmText;

</script>

<button class="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#myModal" id="btn-confirm-modal"></button>

<!-- The Modal -->
<div class="modal fade" id="myModal" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog">
        <div class="modal-content">

            <!-- Modal Header -->
            <div class="modal-header">
                <h4 class="modal-title">Confirm</h4>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <!-- Modal body -->
            <div class="modal-body">
                {confirmText}
            </div>

            <!-- Modal footer -->
            <div class="modal-footer">
                <button type="button" class="btn btn-primary">Yes</button>
                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">No</button>
            </div>

        </div>
    </div>
</div>
