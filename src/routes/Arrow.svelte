<script>
  import {scale, fade} from "svelte/transition";
  import Popup from "./Popup.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";
  import {onMount} from "svelte";

  const MARKER_SIZE = 4;

  let {arrow = $bindable(), offset, removeArrow, index, canvasScale} = $props();
  let position = $derived({
    x1: offset.x + arrow.x1,
    x2: offset.x + arrow.x2,
    y1: offset.y + arrow.y1,
    y2: offset.y + arrow.y2
  });
  let widthWithScale = $derived({marker: MARKER_SIZE * canvasScale, line: arrow.width * canvasScale});

  let arrowPosBefore = {x1: 0, y1: 0, x2: 0, y2: 0};
  let moveEntireArrow = new DraggableObject(
    () => {
      arrow.selected = true;
      arrowPosBefore.x1 = arrow.x1;
      arrowPosBefore.y1 = arrow.y1;
      arrowPosBefore.x2 = arrow.x2;
      arrowPosBefore.y2 = arrow.y2;
    },
    (dx, dy) => {
      arrow.x1 = arrowPosBefore.x1 + dx;
      arrow.y1 = arrowPosBefore.y1 + dy;
      arrow.x2 = arrowPosBefore.x2 + dx;
      arrow.y2 = arrowPosBefore.y2 + dy;
    });

  let moveEnd = new DraggableObject(
    () => {
      arrowPosBefore.x2 = arrow.x2;
      arrowPosBefore.y2 = arrow.y2;
    },
    (dx, dy) => {
      arrow.x2 = arrowPosBefore.x2 + dx;
      arrow.y2 = arrowPosBefore.y2 + dy;
      dispatchEvent(new CustomEvent("arrowMove", {detail: {x: position.x2, y: position.y2, index, pos: "end"}}));
    });

  let moveFront = new DraggableObject(
    () => {
      arrowPosBefore.x1 = arrow.x1;
      arrowPosBefore.y1 = arrow.y1;
    },
    (dx, dy) => {
      arrow.x1 = arrowPosBefore.x1 + dx;
      arrow.y1 = arrowPosBefore.y1 + dy;
      dispatchEvent(new CustomEvent("arrowMove", {detail: {x: position.x1, y: position.y1, index, pos: "front"}}));
    });

  let isDragging = $derived(moveEntireArrow.isDragging || moveFront.isDragging || moveEnd.isDragging);

  onMount(() => {
    window.addEventListener(`arrowSnap${index}`, ({detail: {x, y, pos}}) => {
      // x and y include offset so remove offset for arrow
      if (pos === "end") {
        arrow.x2 = x - offset.x;
        arrow.y2 = y - offset.y;
      } else if (pos === "front") {
        arrow.x1 = x - offset.x;
        arrow.y1 = y - offset.y;
      }
    });
  })
</script>

<defs>
  <marker id="arrowHead{index}" refX="{5}" refY="{5}"
          markerWidth="{widthWithScale.marker}"
          markerHeight="{widthWithScale.marker}"
          orient="auto-start-reverse" viewBox="0 0 10 10">
    <path fill="{arrow.color.toHex()}" d="M 0 0 L 10 5 L 0 10 z"/>
  </marker>

  <marker id="end{index}" refX="{5}" refY="{5}"
          markerWidth="{widthWithScale.marker}"
          markerHeight="{widthWithScale.marker}"
          orient="auto-start-reverse">
    <!-- put other arrow options for ending (as well as front)   -->
  </marker>
</defs>

<line
  transition:scale={{duration: 120}}
  style="transform-origin: {(position.x1 + position.x2) / 2}px {(position.y1 + position.y2) / 2}px;"
  onmousedown="{moveEntireArrow.setDrag}"
  x1={position.x1}
  y1={position.y1}
  x2={position.x2}
  y2={position.y2}
  stroke="{arrow.color.toHex()}"
  stroke-width={widthWithScale.line}
  marker-end="url(#arrowHead{index})"
  marker-start="url(#end{index})"
  role="presentation"></line>

{#if arrow.selected}

  {#snippet draggableCircle(cx, cy, onmousedown)}
    <circle
      transition:fade={{duration: 120}}
      style="transform-origin: {(position.x1 + position.x2) / 2}px {(position.y1 + position.y2) / 2}px;"
      {cx} {cy}
      {onmousedown}
      r="4"
      fill="white"
      stroke="black"
      role="presentation"></circle>
  {/snippet}

  {@render draggableCircle(position.x1, position.y1, moveFront.setDrag)}
  {@render draggableCircle(position.x2, position.y2, moveEnd.setDrag)}

  <Popup x={((position.x1 + position.x2) / 2)}
         y={((position.y1 + position.y2) / 2) - 55}
         bind:shape={arrow}
         removeShape={removeArrow}
         {isDragging}/>
{/if}


<style>
  line {
    cursor: pointer;
    transition: stroke var(--shape-transition-timing);
  }

  circle {
    cursor: grab;
  }

</style>