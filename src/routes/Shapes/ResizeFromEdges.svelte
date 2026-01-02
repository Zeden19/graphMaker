<script>
  import {fade} from "svelte/transition";
  import DraggableObject from "./DraggableObject.svelte.js";
  import rotateCords from "$lib/rotateCords.js";

  let {shape} = $props();

  // Get the axis-aligned bounding box for handle positioning
  let aabbTopLeft = $derived(shape.getAxisAlignedTopLeft());

  let points = $derived([
    { // top-left
      bbox: true,
      x: aabbTopLeft.x,
      y: aabbTopLeft.y,
      resizeFnc: (dx, dy, width, height) => {
        shape.changeTop(dy, height);
        shape.changeLeft(dx, width);
      }
    },
    {   // top-center
      x: aabbTopLeft.x + shape.width / 2,
      y: aabbTopLeft.y,
      resizeFnc: (dx, dy, width, height) => {
        shape.changeTop(dy, height);
      }
    },
    {    // top-right
      bbox: true,
      x: aabbTopLeft.x + shape.width,
      y: aabbTopLeft.y,
      resizeFnc: (dx, dy, width, height) => {
        shape.changeTop(dy, height);
        shape.changeRight(dx, width);
      }
    },
    {   // middle-right
      x: aabbTopLeft.x + shape.width,
      y: aabbTopLeft.y + shape.height / 2,
      resizeFnc: (dx, dy, width) => {
        shape.changeRight(dx, width);
      }
    },
    {   // bottom-right
      bbox: true,
      x: aabbTopLeft.x + shape.width,
      y: aabbTopLeft.y + shape.height,
      resizeFnc: (dx, dy, width, height) => {
        shape.changeBottom(dy, height);
        shape.changeRight(dx, width);
      }
    },
    {   // bottom-center
      x: aabbTopLeft.x + shape.width / 2,
      y: aabbTopLeft.y + shape.height,
      resizeFnc: (dx, dy, width, height) => {
        shape.changeBottom(dy, height);
      }
    },
    {   // bottom-left
      bbox: true,
      x: aabbTopLeft.x,
      y: aabbTopLeft.y + shape.height,
      resizeFnc: (dx, dy, width, height) => {
        shape.changeBottom(dy, height);
        shape.changeLeft(dx, width);
      }
    },
    {  // middle-left
      x: aabbTopLeft.x,
      y: aabbTopLeft.y + shape.height / 2,
      resizeFnc: (dx, dy, width) => {
        shape.changeLeft(dx, width);
      }
    }
  ].map(point => {
    return {
      ...rotateCords(point.x, point.y, shape.center, shape.rotation),
      bbox: point.bbox,
      resizeFnc: point.resizeFnc
    };
  }));

  let bboxCords = $derived(points.filter(point => point.bbox).map(point => {
    return `${point.x},${point.y}`;
  }));

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
  {#each points as point}
    <circle role="presentation" r="4" fill="white" stroke-width="1" stroke="gray" cx={point.x} cy={point.y}
            transition:fade={{duration: 120}}
            onmousedown={event => handleResize(event, point.resizeFnc)}></circle>
  {/each}

  <polyline fill="none" stroke="white" stroke-width="1"
            points="{bboxCords.join(' ')} {bboxCords[0]}"></polyline>

{/if}