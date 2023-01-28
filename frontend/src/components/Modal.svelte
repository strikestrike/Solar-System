<script>
    import {onMount} from 'svelte';

    export let showConfirm = false;
    export let confirmText;
    export let confirmOkText;

    let showConfirmWatch;

    let confirmModal = null;

    onMount(() => {
        confirmModal = new bootstrap.Modal('#myModal', {
            backdrop: 'static',
            keyboard: false
        });

        showConfirmWatch = showConfirm;
        console.log(showConfirmWatch);
    });

    $: if(showConfirmWatch !== showConfirm) {
        showConfirmWatch = showConfirm;
        //call your function here
        showConfirmModal();
    }

    function showConfirmModal(){
        if(showConfirmWatch && confirmModal){
            confirmModal.show();
        }
    }

</script>

{showConfirm}

<!-- The Modal -->
<div class="modal fade" id="myModal">
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
                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">{confirmOkText}</button>
                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cancle</button>
            </div>

        </div>
    </div>
</div>
