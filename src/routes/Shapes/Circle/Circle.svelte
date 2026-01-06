<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";

  let {circle = $bindable()} = $props();

  // Use axis-aligned top-left for text positioning
  let renderPosition = $derived(circle.getAxisAlignedTopLeft());
</script>

<ellipse
  transition:scale|global={{duration: 120}}
  rx="{circle.width / 2}"
  ry="{circle.height / 2}"
  cx="{circle.center.x}"
  cy="{circle.center.y}"
  fill="{circle.color}"
  stroke={circle.strokeColor}
  stroke-width="{circle.strokeWidth * 2}"
  style="transform-origin: {circle.center.x}px {circle.center.y}px;
         rotate: {circle.rotation}deg"
  role="presentation"
  bind:this={circle.ref}
/>

<ShapeText shape={circle}
           transformOrigin={circle.center}
           x={renderPosition.x}
           y={renderPosition.y}
           width={Math.abs(circle.width)}
           height={Math.abs(circle.height)}/>

<style>
  ellipse {
    cursor: grab;
    transition: fill var(--shape-transition-timing), stroke var(--shape-transition-timing);
    paint-order: stroke;
  }
</style>