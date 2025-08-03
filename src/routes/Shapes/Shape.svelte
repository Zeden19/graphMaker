<script>
  import {onDestroy, onMount} from "svelte";

  let {shape = $bindable(), children, editShapeContainerRef} = $props();

  let gRef = $state();

  const deselect = (event) => {
    if (shape && gRef && !(gRef.contains(event.target)) && !(editShapeContainerRef.contains(event.target))) {
      shape.selected = false;
    }
  };

  const deleteWithKey = (event) => {
    if (shape && !shape.selected) return;
    if (event.key.toLowerCase() === "backspace") shape.delete();
  }

  onMount(async () => {
    window.addEventListener("mousedown", deselect);
    window.addEventListener("keydown", deleteWithKey)
  });

  onDestroy(() => {
    window.removeEventListener("mousedown", deselect);
    window.removeEventListener("keydown", deleteWithKey)
  });
</script>

<g bind:this={gRef}>
  {@render children()}
</g>

<style></style>