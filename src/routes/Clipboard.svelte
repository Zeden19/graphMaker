<script>
  import {onMount} from "svelte";

  let {selectedShape, addShape} = $props();

  let clipboard = $state();

  onMount(() => {
    document.addEventListener("copy", async (event) => {
      if (!selectedShape) return;
      clipboard = selectedShape;
      event.preventDefault();
    });

    document.addEventListener("cut", async (event) => {
      if (!selectedShape) return;
      clipboard = selectedShape;
      selectedShape.delete();
      event.preventDefault();
    });

    document.addEventListener("paste", async (event) => {
      if (!clipboard) return;
      addShape(clipboard.toString());
      event.preventDefault();
    });
  })
</script>