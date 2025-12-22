<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";

  let {square} = $props();

  let transformOrigin = $derived({
    x: square.position.x + (square.widthWithScale / 2),
    y: square.position.y + (square.heightWithScale / 2)
  });
</script>

<rect
  transition:scale|global={{duration: 120}}
  style="transform-origin: {transformOrigin.x}px
                           {transformOrigin.y}px;
         rotate: {square.rotation}deg;
  outline: {square.strokeColor} {square.strokeWidth}px solid;"
  x="{square.position.x}"
  y="{square.position.y}"
  width="{square.widthWithScale}"
  height="{square.heightWithScale}"
  fill="{square.color}"
></rect>

<ShapeText shape={square} x={square.position.x} y={square.position.y} {transformOrigin}
           width={square.widthWithScale} height={square.heightWithScale}></ShapeText>

<style>
  rect {
    cursor: grab;
    transition: fill var(--shape-transition-timing), stroke var(--shape-transition-timing);
  }
</style>
