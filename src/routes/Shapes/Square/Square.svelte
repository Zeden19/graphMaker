<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";

  let {square} = $props();
</script>

<rect
  transition:scale|global={{duration: 120}}
  style="transform-origin: {square.position.x}px {square.position.y}px;
  outline: {square.strokeColor.toHex()} {square.strokeWidth}px solid;"
  x="{square.position.x}"
  y="{square.position.y}"
  width="{square.widthWithScale}"
  height="{square.heightWithScale}"
  fill="{square.color.toHex()}"

></rect>

<ShapeText selected={square.selected} text={square.text} shape={square}
           style="overflow: visible"
           x={square.position.x} y={square.position.y}
           width={square.widthWithScale} height={square.heightWithScale}></ShapeText>

<style>
  rect {
    cursor: grab;
    transition: fill var(--shape-transition-timing), stroke var(--shape-transition-timing);
  }
</style>
