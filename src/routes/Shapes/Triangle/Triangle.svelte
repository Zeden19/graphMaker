<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";

  let {triangle = $bindable()} = $props();

  // Use axis-aligned top-left for text positioning
  let renderPosition = $derived(triangle.getAxisAlignedTopLeft());

  let coords = $derived.by(() => {
    return {
      point1: {
        x: renderPosition.x + triangle.width / 2,
        y: renderPosition.y + triangle.strokeWidth
      },
      point2: {
        x: renderPosition.x + triangle.strokeWidth / 2,
        y: renderPosition.y + triangle.height
      },
      point3: {
        x: renderPosition.x + triangle.width - triangle.strokeWidth / 2,
        y: renderPosition.y + triangle.height
      }
    };
  });

</script>

<polygon
  transition:scale|global={{duration: 120}}
  points="{coords.point1.x},{coords.point1.y}
          {coords.point2.x},{coords.point2.y}
          {coords.point3.x},{coords.point3.y}"
  fill={triangle.color}
  stroke="{triangle.strokeColor}"
  stroke-width="{triangle.strokeWidth * 2}"
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
    paint-order: stroke;
  }
</style>
