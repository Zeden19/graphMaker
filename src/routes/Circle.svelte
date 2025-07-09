<script>
  import {scale, fade} from "svelte/transition";
  import resize from "$lib/assets/resize.png";
  import Popup from "./Popup.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";
  import {onMount} from "svelte";

  let {circle = $bindable(), removeCircle, index} = $props();

  let circlePosBefore = {x: 0, y: 0};
  const moveCircle = new DraggableObject(
    () => {
      circle.selected = true;
      circlePosBefore.x = circle.x;
      circlePosBefore.y = circle.y;
    },
    (dx, dy) => {
      circle.x = circlePosBefore.x + dx;
      circle.y = circlePosBefore.y + dy;
    });

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

  let isDragging = $derived(moveCircle.isDragging || resizeCircle.isDragging);

  onMount(() => {
    window.addEventListener("arrowMove", ({detail: {x, y, index: arrowIndex, pos}}) => {
      const areaSize = 20;

      Object.entries(circle.circleRect.basic).forEach(([location, point]) => {
        if ((x < point.x + areaSize && x > point.x - areaSize) &&
          (y < point.y + areaSize && y > point.y - areaSize)) {
          dispatchEvent(new CustomEvent(`arrowSnap${arrowIndex}`, {detail: {index, location, pos}}))
        }
      });
    });
  });
</script>

<circle
  transition:scale={{duration: 120}}
  onmousedown={moveCircle.setDrag}
  r="{circle.radiusWithScale}"
  cx="{circle.positionX}"
  cy="{circle.positionY}"
  fill="{circle.color.toHex()}"
  stroke={"black"}
  stroke-width="2"
  role="presentation"
  style="transform-origin: {circle.positionX}px {circle.positionY}px;"
/>

{#if circle.selected}
  <foreignObject
    x="{circle.circleRect.bottomRight.x}"
    y="{circle.circleRect.bottomRight.y}"
    width="40"
    height="40">
    <button class="no-select" transition:fade={{duration: 130}} onmousedown="{resizeCircle.setDrag}">
      <img
        src="{resize}" alt="resize" width="30" draggable="false"/>
    </button>
  </foreignObject>


  <Popup x={circle.circleRect.basic.top.x}
         y={circle.circleRect.basic.top.y - 52.5}
         bind:shape={circle}
         removeShape={removeCircle}
         {isDragging}/>
{/if}

<style>
  circle {
    cursor: grab;
    transition: fill var(--shape-transition-timing);
  }

  button {
    cursor: nwse-resize;
  }
</style>