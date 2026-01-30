<script>
  import {toast} from "$lib/stores/toast.js";
  import {currentUser, authLoading} from "$lib/stores/auth.js";
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

  onMount(async () => {
    if ($currentUser) return;
    try {
      const response = await fetch("/accounts/me", {credentials: "include"});
      if (response.ok) {
        const payload = await response.json().catch(() => ({}));
        $currentUser = payload?.user ?? null;
      } else {
        $currentUser = null;
      }
    } catch {
      $currentUser = null;
    } finally {
      $authLoading = false;
    }
  });
</script>

{@render children()}

{#if $toast}
  <Toast {...$toast}/>
{/if}