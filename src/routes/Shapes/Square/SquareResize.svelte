<script>
  import DraggableObject from "../DraggableObject.svelte.js";
  import ResizeCircle from "../ResizeCircle.svelte";

  let {square = $bindable(), x, y, changeSizeFnc, cursor="nwse-resize"} = $props();

  let sizeBefore = $state({width: square.width, height: square.height});
  const resize = new DraggableObject(
    () => {
      sizeBefore.width = square.width;
      sizeBefore.height = square.height;
    },
    (dx, dy) => {
      changeSizeFnc(dx, dy, sizeBefore.width, sizeBefore.height);
    }
  )
</script>

<ResizeCircle {x} {y} {cursor} setDrag={resize.setDrag}/>