<script>
  import {scale, fade} from "svelte/transition";
  import resize from "$lib/assets/resize.png";
  import Popup from "./Popup.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";
  import {onMount} from "svelte";
  import Text from "./Text.svelte";

  let {circle = $bindable(), removeCircle} = $props();

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

  const arrowIndexes = []
  onMount(() => {
    const areaSize = 20;

    const onArrowMove = ({detail: {x, y, index: arrowIndex, pos}}) => {
      Object.entries(circle.circleRect).forEach(([location, point]) => {
        if ((x < point.x + areaSize && x > point.x - areaSize) &&
          (y < point.y + areaSize && y > point.y - areaSize)) {

          if (!arrowIndexes.map(arrow => arrow.index).includes(arrowIndex)) {
            arrowIndexes.push({index: arrowIndex, pos});
          }
          const circleRef = () => circle.circleRect[location];
          dispatchEvent(new CustomEvent(`arrowSnap${arrowIndex}`, {detail: {pos, circleRef}}));
        }
      });
    }

    window.addEventListener("arrowMove", onArrowMove);
    return () => {
      window.removeEventListener("arrowMove", onArrowMove);
    }
  });

  let fontSize = $state(0.8);

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


<foreignObject style="pointer-events: none" x={circle.circleRect.topLeft.x} y={circle.circleRect.topLeft.y}
               width={circle.circleRect.topRight.x - circle.circleRect.topLeft.x}
               height={circle.circleRect.bottomLeft.y - circle.circleRect.topLeft.y}
>
  <Text {fontSize} selected={circle.selected} color="black"></Text>
</foreignObject>

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

  <Popup x={circle.circleRect.top.x}
         y={circle.circleRect.top.y - 52.5}
         bind:shape={circle}
         removeShape={() => {
           // DO NOT CHANGE; prevents arrow positions from reading a deleted value since cleanup functions
           // happen AFTER the splice occurs
           arrowIndexes.forEach(({index, pos}) => {
                dispatchEvent(new CustomEvent(`circleDelete${index}`, {detail: {pos}}));
              });
           removeCircle()
         }}
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