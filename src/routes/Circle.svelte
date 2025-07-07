<script>
  import {scale, fade} from "svelte/transition";
  import resize from "$lib/assets/resize.png";
  import Popup from "./Popup.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";
  import {onMount} from "svelte";

  let {circle = $bindable(), removeCircle} = $props();

  let arrowsSnapped = $state({
    top: [],
    bottom: [],
    left: [],
    right: [],
  })

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
      Object.entries(circle.circleRect.basic).forEach(([area, {x, y}]) => {
        if (arrowsSnapped[area].length !== 0) {
          arrowsSnapped[area].forEach(({index, pos}) => {
            dispatchEvent(new CustomEvent(`arrowSnap${index}`, {detail: {x, y, pos}}))
          });
        }
      });
    });

  const resizeCircle = new DraggableObject(
    () => {},
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
    window.addEventListener("arrowMove", ({detail: {x, y, index, pos}}) => {
      const areaSize = 20;

      Object.entries(circle.circleRect.basic).forEach(([area, point]) => {
        if ((x < point.x + areaSize && x > point.x - areaSize) &&
          (y < point.y + areaSize && y > point.y - areaSize)) {

          if (!arrowsSnapped[area].map(({index}) => index).includes(index)) {
            arrowsSnapped[area].push({index, pos})
          }

          dispatchEvent(new CustomEvent(`arrowSnap${index}`,
            {detail: {x: point.x, y: point.y, pos}}))
        } else {
          arrowsSnapped[area] = arrowsSnapped[area].filter(arrow => !(arrow.index === index && arrow.pos === pos));
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