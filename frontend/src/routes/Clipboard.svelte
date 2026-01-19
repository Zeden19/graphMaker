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
      if (shape.cx !== undefined) {
        shape.cx = shape.cx + 20;
        shape.cy = shape.cy + 20;
      }
    }
  }

  const insertToClipboard = () => {
    if (!selectedShapes) return;
    clipboard = selectedShapes.map(shape => ({
      shapeClass: shape.constructor,
      properties: shape.toJSON()
    }));
  }

  onMount(() => {
    document.addEventListener("copy", async (event) => {
      insertToClipboard();
      event.preventDefault();
    });

    document.addEventListener("cut", async (event) => {
      insertToClipboard();
      selectedShapes.forEach(shape => shape.delete());
      event.preventDefault();
    });

    document.addEventListener("paste", async (event) => {
      if (!clipboard) return;
      clipboard.forEach(({shapeClass, properties}) => {
        moveShapePos(properties);
        addShape(shapeClass, properties)
      });
      event.preventDefault();
    });
  })
</script>
