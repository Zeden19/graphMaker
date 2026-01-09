<script>
  import {fade} from "svelte/transition";
  import DraggableObject from "./DraggableObject.svelte.js";
  import rotateCords from "$lib/rotateCords.js";

  let {shape} = $props();

  function handleResize(event, resizeFnc) {
    let sizeBefore = {}
    const drag = new DraggableObject(
      () => {
        shape.isEditing = true;
        sizeBefore.width = shape.width;
        sizeBefore.height = shape.height;
      },
      (dx, dy) => {
        const rotatedDeltas = rotateCords(dx, dy, {x: 0, y: 0}, -shape.rotation);
        resizeFnc(rotatedDeltas.x, rotatedDeltas.y, sizeBefore.width, sizeBefore.height);
      },
      () => {
        shape.isEditing = false;
      }
    );
    drag.setDrag(event);
  }

  const cursorForHandle = (handle, rotation) => {
    const baseAngles = {
      top: 90,
      right: 0,
      bottom: 270,
      left: 180,
      topRight: 45,
      topLeft: 135,
      bottomLeft: 225,
      bottomRight: 315
    };
    const angle = (baseAngles[handle] + rotation) % 360;
    const snapped = Math.round(angle / 45) * 45;

    switch (snapped) {
      case 0:
      case 180:
      case 360:
        return "ew-resize";
      case 90:
      case 270:
        return "ns-resize";
      case 45:
      case 225:
        return "nesw-resize";
      case 135:
      case 315:
        return "nwse-resize";
      default:
        return "default";
    }
  }

</script>

{#if shape.selected}
  {#each shape.points as point}
    <circle role="presentation" r="4" fill="white" stroke-width="1" stroke="gray" cx={point.x} cy={point.y}
            style="cursor: {cursorForHandle(point.handle, shape.rotation)}"
            transition:fade={{duration: 120}}
            onmousedown={event => handleResize(event, point.resizeFnc)}></circle>
  {/each}

  <polyline fill="none" stroke="white" stroke-width="1"
            points="{shape.corners.map(point => `${point.x},${point.y} `)} {shape.corners[0].x}, {shape.corners[0].y}"></polyline>

{/if}
