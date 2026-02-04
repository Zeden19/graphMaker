<script>
  import {setContext} from "svelte";

  let {children} = $props();

  let open = $state();
  const api = {
    get open() {
      return open;
    },
    setOpen(value) {
      open = value;
    },
  }

  setContext("dialog", api);
</script>

{@render children()}