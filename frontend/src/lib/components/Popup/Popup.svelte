<script>
  import {onMount, setContext} from "svelte";

  let {onToggle, children} = $props();

  let open = $state();
  let popupArea = $state();

  const api = {
    get open() {
      return open;
    },
    setOpen(value) {
      open = value;
    },
    toggle() {
      onToggle?.(open)
      open = !open;
    }
  };

  setContext("popup", api);

  const handleWindowClick = (event) => {
    if (popupArea && !(popupArea.contains(event.target))) {
      api.setOpen(false)
    }
  };

  onMount(() => {
    document.addEventListener("click", handleWindowClick);

    return () => {
      document.removeEventListener("click", handleWindowClick);
    }
  });
</script>


<div class="root" bind:this={popupArea}>
  {@render children()}
</div>

<style>
  .root {
    position: relative;
    display: flex;
    align-items: center;
  }
</style>