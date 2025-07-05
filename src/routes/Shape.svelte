<script>
  import {onDestroy, onMount} from "svelte";

  let {shape = $bindable(), children} = $props();

  let gRef = $state();

  const deselect = (event) => {
    if (gRef && !(gRef.contains(event.target))) {
      shape.selected = false;
    }
  };

  onMount(() => {
    window.addEventListener("mousedown", deselect);
  });

  onDestroy(() => {
    window.removeEventListener("mousedown", deselect);
  });


</script>
<g bind:this={gRef}>
  {@render children()}
</g>

<style></style>