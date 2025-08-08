<script>
  import {onMount} from "svelte";
  import {colord} from "colord";

  let {selectedShape, addShape} = $props();

  let clipboard = $state();

  onMount(() => {
    document.addEventListener("copy", async (event) => {
      if (!selectedShape) return;
      clipboard = JSON.parse(JSON.stringify(selectedShape));
      event.preventDefault();
    });

    document.addEventListener("cut", async (event) => {
      if (!selectedShape) return;
      clipboard = JSON.parse(JSON.stringify(selectedShape));
      selectedShape.delete();
      event.preventDefault();
    });

    document.addEventListener("paste", async (event) => {
      if (!clipboard) return;
      const shapeProperties = clipboard;
      shapeProperties.color = colord(shapeProperties.color);
      addShape(shapeProperties.toString, shapeProperties);
      event.preventDefault();
    });
  })
</script>