<script>
  import {scale, fade} from "svelte/transition";
  import resize from "$lib/assets/resize.png";
  import DraggableObject from "./DraggableObject.svelte.js";
  import {onMount} from "svelte";
  import ShapeText from "./Text/ShapeText.svelte";

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

  onMount(() => {
    const areaSize = 20;

    const onArrowMove = ({detail: {x, y, index: arrowIndex, pos}}) => {
      Object.entries(circle.circleRect).forEach(([location, point]) => {
        if ((x < point.x + areaSize && x > point.x - areaSize) &&
          (y < point.y + areaSize && y > point.y - areaSize)) {

          if (!circle.arrowsSnappedIndexes.map(arrow => arrow.index).includes(arrowIndex)) {
            circle.arrowsSnappedIndexes.push({index: arrowIndex, pos});
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


<foreignObject style="pointer-events: none" x={circle.circleRect.topLeft.x} y={circle.circleRect.topLeft.y}
               width={circle.circleRect.topRight.x - circle.circleRect.topLeft.x}
               height={circle.circleRect.bottomLeft.y - circle.circleRect.topLeft.y}
>
  <ShapeText selected={circle.selected} text={circle.text}></ShapeText>
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