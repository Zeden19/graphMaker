<script>
  import {scale} from "svelte/transition";
  import DraggableObject from "../DraggableObject.svelte.js";
  import ShapeText from "../Text/ShapeText.svelte";
  import ResizeCircle from "../ResizeCircle.svelte";

  let {circle = $bindable()} = $props();

  const resizeCircle = new DraggableObject(
    () => {
      circle.isEditing = true;
    },
    (dx, dy) => {
      const isNegative = dx < 0 || dy < 0;
      let distance = Math.sqrt(dx * dx + dy * dy) / 10;
      if (isNegative) {
        distance *= -1;
      }
      circle.r = Math.max(20, circle.r + distance);
    },
    () => {
      circle.isEditing = false;
    });
</script>

<circle
  transition:scale|global={{duration: 120}}
  r="{circle.radiusWithScale}"
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

{#if circle.selected}
  <ResizeCircle x={circle.rect.bottomRight.x}
                y={circle.rect.bottomRight.y}
                setDrag={resizeCircle.setDrag}
                cursor="nwse-resize"/>
{/if}

<style>
  circle {
    cursor: grab;
    transition: fill var(--shape-transition-timing), stroke var(--shape-transition-timing);
  }
</style>