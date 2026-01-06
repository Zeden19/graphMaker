<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";

  let {square} = $props();

  // Use the axis-aligned top-left for rendering
  let renderPosition = $derived(square.getAxisAlignedTopLeft());
</script>

<rect
  transition:scale|global={{duration: 120}}
  style="transform-origin: {square.center.x}px {square.center.y}px;
         rotate: {square.rotation}deg;"
  stroke="{square.strokeColor}"
  stroke-width="{square.strokeWidth * 2}"
  x="{renderPosition.x}"
  y="{renderPosition.y}"
  width="{square.width}"
  height="{square.height}"
  fill="{square.color}"
  bind:this={square.ref}
></rect>

<ShapeText shape={square} x={renderPosition.x} y={renderPosition.y}
           transformOrigin={square.center}
           width={square.width} height={square.height}></ShapeText>

<style>
  rect {
    cursor: grab;
    transition: fill var(--shape-transition-timing), stroke var(--shape-transition-timing);
    paint-order: stroke;
  }
</style>