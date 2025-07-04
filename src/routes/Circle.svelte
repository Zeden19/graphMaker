<script>
  import {scale, fade} from "svelte/transition";
  import resize from "$lib/assets/resize.png";
  import Popup from "./Popup.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";

  let {circle = $bindable(), offset, removeCircle, canvasScale} = $props();

  let radiusWithScale = $derived(circle.r * canvasScale);
  let position = $derived({x: offset.x + circle.x, y: offset.y + circle.y});
  let circleRect = $derived.by(() => {
    const bottomRightAngle = 45 * Math.PI / 180; // 45 degrees
    const bottomLeftAngle = 135 * Math.PI / 180; // 135 degrees
    const topRightAngle = 315 * Math.PI / 180; // 315 degrees
    const topLeftAngle = 225 * Math.PI / 180; // 225 degrees

    return {
      top: position.y - radiusWithScale,
      bottom: position.y + radiusWithScale,
      left: position.x - radiusWithScale,
      right: position.x + radiusWithScale,

      bottomRight: {
        x: position.x + radiusWithScale * Math.cos(bottomRightAngle),
        y: position.y + radiusWithScale * Math.sin(bottomRightAngle)
      },

      bottomLeft: {
        x: position.x + radiusWithScale * Math.cos(bottomLeftAngle),
        y: position.y + radiusWithScale * Math.sin(bottomLeftAngle)
      },

      topRight: {
        x: position.x + radiusWithScale * Math.cos(topRightAngle),
        y: position.y + radiusWithScale * Math.sin(topRightAngle)
      },

      topLeft: {
        x: position.x + radiusWithScale * Math.cos(topLeftAngle),
        y: position.y + radiusWithScale * Math.sin(topLeftAngle)
      }
    };
  });

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

  let circleRef = $state();
  let resizeRef = $state();

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
  style="transform-origin: {position.x}px {position.y}px; {circle.selected ? 'outline: 1px solid white;' : ''}"
  bind:this={circleRef}
/>

{#if circle.selected}
  <foreignObject
    x="{circleRect.bottomRight.x}"
    y="{circleRect.bottomRight.y}"
    width="40"
    height="40">
    <button class="no-select" transition:fade={{duration: 130}} onmousedown="{resizeCircle.setDrag}">
      <img bind:this={resizeRef} src="{resize}" alt="resize" width="30" draggable="false"/>
    </button>
  </foreignObject>


  <Popup x={position.x}
         y={circleRect.top - 52.5}
         bind:shape={circle}
         popupRefs={[circleRef, resizeRef]}
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