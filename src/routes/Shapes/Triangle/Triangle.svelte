<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";

  let {triangle = $bindable()} = $props();

  // Use axis-aligned top-left for text positioning
  let renderPosition = $derived(triangle.getAxisAlignedTopLeft());
</script>

<polygon
  transition:scale|global={{duration: 120}}
  points="{triangle.coords.point1.x},{triangle.coords.point1.y}
          {triangle.coords.point2.x},{triangle.coords.point2.y}
          {triangle.coords.point3.x},{triangle.coords.point3.y}"
  fill={triangle.color}
  stroke="{triangle.strokeColor}"
  stroke-width="{triangle.strokeWidth}"
  style="transform: rotate({triangle.rotation}deg);
       transform-origin: {triangle.center.x}px {triangle.center.y}px;"
  bind:this={triangle.ref}>
</polygon>

<ShapeText
  shape={triangle}
  x={renderPosition.x}
  y={renderPosition.y}
  transformOrigin={triangle.center}
  width={triangle.width}
  height={triangle.height}
/>

<style>
  polygon {
    cursor: pointer;
    transition: stroke var(--shape-transition-timing);
  }
</style>
