<script>
  import {onMount} from "svelte";

  let {selectedShapes, addShape} = $props();

  let clipboard = $state();

  const moveShapePos = (shape) => {
    if (shape.x) {
      shape.x = shape.x + 20;
      shape.y = shape.y + 20;
    } else {
      shape.x1 = shape.x1 + 20;
      shape.y1 = shape.y1 + 20;
      shape.x2 = shape.x2 + 20;
      shape.y2 = shape.y2 + 20;
    }
  }

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
      clipboard.forEach(shape => {
        moveShapePos(shape);
        addShape(shape.toString, shape)
      });
      event.preventDefault();
    });
  })
</script>