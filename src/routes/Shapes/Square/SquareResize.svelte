<script>
  import {fade} from "svelte/transition";
  import DraggableObject from "../DraggableObject.svelte.js";

  let {square = $bindable(), x, y, changeSizeFnc, cursor} = $props();

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

<circle
  transition:fade={{duration: 120}}
  onmousedown="{resize.setDrag}"
  style="transform-origin: {x}px {y}px; cursor: {cursor}"
  cx="{x}" cy="{y}"
  r="4"
  fill="white"
  stroke="black"
  role="presentation">
</circle>