<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";

  let {square, removeSquare} = $props();
</script>

<rect
  transition:scale={{duration: 120}}
  style="transform-origin: {square.position.x}px {square.position.y}px;"
  x="{square.position.x}"
  y="{square.position.y}"
  width="{square.widthWithScale}"
  height="{square.heightWithScale}"
  fill="{square.color.toHex()}"
  onmousedown="{square.setDrag}"
  stroke="{square.strokeColor.toHex()}"
  stroke-width="{square.strokeWidth}"
  role="presentation"></rect>

<ShapeText selected={square.selected} text={square.text}
           style="pointer-events: none"
           x={square.position.x} y={square.position.y}
           width={square.widthWithScale} height={square.heightWithScale}></ShapeText>

<style>
  rect {
    cursor: grab;
    transition: fill var(--shape-transition-timing), stroke var(--shape-transition-timing);
  }
</style>
