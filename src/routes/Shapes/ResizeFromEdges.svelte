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

  const getCursor = (key) => {
    switch (key) {
      case "top":
      case "bottom" :
        return "ns"
      case "right":
      case "left" :
        return "ew"
      case "topLeft" :
      case "bottomRight":
        return "nwse"
      case "topRight" :
      case "bottomLeft" :
        return "nesw"
    }
  }

</script>

{#if shape.selected}
  {#each shape.points as point}
    <circle role="presentation" r="4" fill="white" stroke-width="1" stroke="gray" cx={point.x} cy={point.y}
            transition:fade={{duration: 120}}
            onmousedown={event => handleResize(event, point.resizeFnc)}></circle>
  {/each}

  <polyline fill="none" stroke="white" stroke-width="1"
            points="{shape.corners.map(point => `${point.x},${point.y} `)} {shape.corners[0].x}, {shape.corners[0].y}"></polyline>

{/if}