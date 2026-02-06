<script>
  import {toast} from "$lib/stores/toast.js";
  import {initCurrentUser} from "$lib/stores/auth.js";
  import Toast from "$lib/components/Toast.svelte";
  import {onMount} from "svelte";

  const {children} = $props();

  onMount(() => {
    const flash = sessionStorage.getItem("flashToast");
    if (flash) {
      $toast = JSON.parse(flash);
      sessionStorage.removeItem("flashToast");
    }
  });

  onMount(() => {
    initCurrentUser();
  });
</script>

{@render children()}

{#if $toast}
  <Toast {...$toast}/>
{/if}
