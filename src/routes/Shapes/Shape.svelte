<script>
  import {onDestroy, onMount} from "svelte";

  let {shape = $bindable(), children, editShapeContainerRef} = $props();

  let gRef = $state();

  const deselect = (event) => {
    if (gRef && !(gRef.contains(event.target)) && !(editShapeContainerRef.contains(event.target))) {
      shape.selected = false;
    }
  };

  // todo: ensure user isn't selecting something else (like shapeText)
  const copy = async (event) => {
    if (!shape.selected) return;
    await navigator.clipboard.writeText(JSON.stringify(shape));
    event.preventDefault();
  }

  onMount(async () => {
    document.addEventListener("copy", copy);
    window.addEventListener("mousedown", deselect);
  });

  onDestroy(() => {
    window.removeEventListener("copy", copy);
    window.removeEventListener("mousedown", deselect);
  });
</script>

<g bind:this={gRef}>
  {@render children()}
</g>

<style></style>