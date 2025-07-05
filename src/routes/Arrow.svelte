<script>
  import {scale, fade} from "svelte/transition";
  import Popup from "./Popup.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";

  const MARKER_SIZE = 4;

  let {arrow = $bindable(), offset, removeArrow, markerIndex, canvasScale} = $props();
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
    });

  let moveFront = new DraggableObject(
    () => {
      arrowPosBefore.x1 = arrow.x1;
      arrowPosBefore.y1 = arrow.y1;
    },
    (dx, dy) => {
      arrow.x1 = arrowPosBefore.x1 + dx;
      arrow.y1 = arrowPosBefore.y1 + dy;
    });

  let isDragging = $derived(moveEntireArrow.isDragging || moveFront.isDragging || moveEnd.isDragging);
</script>

<defs>
  <marker id="arrowHead{markerIndex}" refX="{5}" refY="{5}"
          markerWidth="{widthWithScale.marker}"
          markerHeight="{widthWithScale.marker}"
          orient="auto-start-reverse" viewBox="0 0 10 10">
    <path fill="{arrow.color.toHex()}" d="M 0 0 L 10 5 L 0 10 z"/>
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
  marker-end="url(#arrowHead{markerIndex})"
  marker-start="url(#end{markerIndex})"
  role="presentation"></line>

{#if arrow.selected}
  <circle
    transition:fade={{duration: 120}}
    style="transform-origin: {(position.x1 + position.x2) / 2}px {(position.y1 + position.y2) / 2}px;"
    cx="{position.x1}"
    cy="{position.y1}"
    r="{4}"
    fill="white"
    stroke="black"
    onmousedown="{moveFront.setDrag}"
    role="presentation">
  </circle>

  <circle
    transition:fade={{duration: 120}}
    style="transform-origin: {(position.x1 + position.x2) / 2}px {(position.y1 + position.y2) / 2}px;"
    cx="{position.x2}"
    cy="{position.y2}"
    r="{4}"
    fill="white"
    stroke="black"
    onmousedown="{moveEnd.setDrag}"
    role="presentation">
  </circle>

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