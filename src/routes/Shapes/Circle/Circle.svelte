<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";

  let {circle = $bindable()} = $props();

</script>

<ellipse
  transition:scale|global={{duration: 120}}
  rx="{circle.width}"
  ry="{circle.height}"
  cx="{circle.position.x}"
  cy="{circle.position.y}"
  fill="{circle.color.toHex()}"
  stroke={circle.strokeColor.toHex()}
  stroke-width="{circle.strokeWidth}"
  style="transform-origin: {circle.position.x}px {circle.position.y}px;"
  role="presentation"
/>

<ShapeText selected={circle.selected} text={circle.text} shape={circle}
           style="pointer-events: none"
           x={circle.rect.topLeft.x} y={circle.rect.topLeft.y}
           width={circle.rect.topRight.x - circle.rect.topLeft.x}
           height={circle.rect.bottomLeft.y - circle.rect.topLeft.y}></ShapeText>

<style>
  circle {
    cursor: grab;
    transition: fill var(--shape-transition-timing), stroke var(--shape-transition-timing);
  }
</style>