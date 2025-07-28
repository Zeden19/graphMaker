<script>
  import {scale, fade} from "svelte/transition";
  import resize from "$lib/assets/resize.png";
  import DraggableObject from "../DraggableObject.svelte.js";
  import ShapeText from "../Text/ShapeText.svelte";

  let {circle = $bindable(), removeCircle} = $props();

  const resizeCircle = new DraggableObject(
    () => {
    },
    (dx, dy) => {
      const isNegative = dx < 0 || dy < 0;
      let distance = Math.sqrt(dx * dx + dy * dy) / 10;
      if (isNegative) {
        distance *= -1;
      }
      circle.r = Math.max(20, circle.r + distance);
    });

</script>

<circle
  transition:scale={{duration: 120}}
  onmousedown={circle.setDrag}
  r="{circle.radiusWithScale}"
  cx="{circle.position.x}"
  cy="{circle.position.y}"
  fill="{circle.color.toHex()}"
  stroke={circle.strokeColor.toHex()}
  stroke-width="{circle.strokeWidth}"
  style="transform-origin: {circle.position.x}px {circle.position.y}px;"
  role="presentation"
/>


<foreignObject style="pointer-events: none" x={circle.rect.topLeft.x} y={circle.rect.topLeft.y}
               width={circle.rect.topRight.x - circle.rect.topLeft.x}
               height={circle.rect.bottomLeft.y - circle.rect.topLeft.y}
>
  <ShapeText selected={circle.selected} text={circle.text}></ShapeText>
</foreignObject>

{#if circle.selected}
  <foreignObject
    x="{circle.rect.bottomRight.x}"
    y="{circle.rect.bottomRight.y}"
    width="40"
    height="40">
    <button class="no-select" transition:fade={{duration: 130}} onmousedown="{resizeCircle.setDrag}">
      <img
        src="{resize}" alt="resize" width="30" draggable="false"/>
    </button>
  </foreignObject>
{/if}

<style>
  circle {
    cursor: grab;
    transition: fill var(--shape-transition-timing), stroke var(--shape-transition-timing);
  }

  button {
    cursor: nwse-resize;
  }
</style>