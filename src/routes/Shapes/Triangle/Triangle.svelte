<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";

  let {triangle = $bindable()} = $props();

</script>

<polygon
  transition:scale|global={{duration: 120}}
  points="{triangle.position.x1},{triangle.position.y1}
          {triangle.position.x2},{triangle.position.y2}
          {triangle.position.x3},{triangle.position.y3}"
  fill={triangle.color}
  stroke="{triangle.strokeColor}"
  stroke-width="{triangle.strokeWidth}"
style="transform: rotate({triangle.rotation}deg);
       transform-origin: {triangle.center.x}px {triangle.center.y}px;">
</polygon>

<ShapeText
  shape={triangle}
  x={triangle.center.x - triangle.width / 2}
  y={triangle.center.y - triangle.height / 2}
  transformOrigin={{x: triangle.center.x, y: triangle.center.y}}
  width="{triangle.width}px"
  height="{triangle.height}px"
/>

<style>
  polygon {
    cursor: pointer;
    transition: stroke var(--shape-transition-timing);
  }
</style>