<script>
  import {onMount} from "svelte";
  import {colord} from "colord";

  let {selectedShapes, addShape} = $props();

  let clipboard = $state();

  onMount(() => {
    document.addEventListener("copy", async (event) => {
      if (!selectedShapes) return;
      clipboard = JSON.parse(JSON.stringify(selectedShapes));
      event.preventDefault();
    });

    document.addEventListener("cut", async (event) => {
      if (!selectedShapes) return;
      clipboard = JSON.parse(JSON.stringify(selectedShapes));
      selectedShapes.forEach(shape => shape.delete());
      event.preventDefault();
    });

    document.addEventListener("paste", async (event) => {
      if (!clipboard) return;
      const shapeProperties = clipboard;
      shapeProperties.forEach(shape => shape.color = colord(shape.color));
      shapeProperties.forEach(shape => addShape(shape.toString, shape));
      event.preventDefault();
    });
  })
</script>