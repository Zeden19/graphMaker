<script>
  import {getContext} from "svelte";

  let {children} = $props();

  const popup = getContext("popup");
</script>

<button class="trigger-button" onclick={popup.toggle}>
  {@render children()}
</button>

<style>
  .trigger-button {
    padding: 0;
  }
</style>