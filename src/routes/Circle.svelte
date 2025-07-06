<script>
  import {scale, fade} from "svelte/transition";
  import resize from "$lib/assets/resize.png";
  import Popup from "./Popup.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";
  import {onMount} from "svelte";

  let {circle = $bindable(), offset, removeCircle, canvasScale} = $props();

  let position = $derived({x: offset.x + circle.x, y: offset.y + circle.y});
  let radiusWithScale = $derived(circle.r * canvasScale);


  const bottomRightAngle = 45 * Math.PI / 180; // 45 degrees
  const bottomLeftAngle = 135 * Math.PI / 180; // 135 degrees
  const topRightAngle = 315 * Math.PI / 180; // 315 degrees
  const topLeftAngle = 225 * Math.PI / 180; // 225 degrees
  let circleRect = $derived(
    {
      basic: {
        top: {
          x: position.x, y: position.y - radiusWithScale,
        },
        bottom: {
          x: position.x, y: position.y + radiusWithScale,
        },
        left: {
          x: position.x - radiusWithScale, y: position.y,
        },
        right: {
          x: position.x + radiusWithScale, y: position.y,
        },
      },
      bottomRight: {
        x: position.x + radiusWithScale * Math.cos(bottomRightAngle),
        y: position.y + radiusWithScale * Math.sin(bottomRightAngle)
      }
    });

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
      Object.entries(circleRect.basic).forEach(([area, {x, y}]) => {
        if (arrowsSnapped[area].length !== 0) {
          arrowsSnapped[area].forEach(({index, pos}) => {
            dispatchEvent(new CustomEvent(`arrowSnap${index}`, {detail: {x, y, pos}}))
          });
        }
      })
    })

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
    window.addEventListener("arrowMove", ({detail: {x, y, index, pos}}) => {
      const areaSize = 20;

      Object.entries(circleRect.basic).forEach(([area, point]) => {
        if ((x < point.x + areaSize && x > point.x - areaSize) &&
          (y < point.y + areaSize && y > point.y - areaSize)) {

          if (!arrowsSnapped[area].map(({index}) => index).includes(index)) {
            arrowsSnapped[area].push({index, pos})
          }

          dispatchEvent(new CustomEvent(`arrowSnap${index}`,
            {detail: {x: point.x, y: point.y, pos}}))
        } else if (arrowsSnapped[area].map(({index}) => index).includes(index)) {
          arrowsSnapped[area] = arrowsSnapped[area].filter(arrow => arrow.index !== index);
        }
      })
    })
  })


</script>

<circle
  transition:scale={{duration: 120}}
  onmousedown={moveCircle.setDrag}
  r="{radiusWithScale}"
  cx="{position.x}"
  cy="{position.y}"
  fill="{circle.color.toHex()}"
  stroke={"black"}
  stroke-width="2"
  role="presentation"
  style="transform-origin: {position.x}px {position.y}px;"
/>

{#if circle.selected}
  <foreignObject
    x="{circleRect.bottomRight.x}"
    y="{circleRect.bottomRight.y}"
    width="40"
    height="40">
    <button class="no-select" transition:fade={{duration: 130}} onmousedown="{resizeCircle.setDrag}">
      <img
        src="{resize}" alt="resize" width="30" draggable="false"/>
    </button>
  </foreignObject>


  <Popup x={circleRect.basic.top.x}
         y={circleRect.basic.top.y - 52.5}
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