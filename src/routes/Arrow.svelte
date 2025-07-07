<script>
  import {scale, fade} from "svelte/transition";
  import Popup from "./Popup.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";
  import {onMount} from "svelte";

  let {arrow = $bindable(), offset, removeArrow, index} = $props();

  let arrowPosBefore = {x1: 0, y1: 0, x2: 0, y2: 0};

  let movingStart = $state();
  let movingEnd = $state();
  let moveArrow = new DraggableObject(
    () => {
      arrow.selected = true;
      arrowPosBefore.x1 = arrow.x1;
      arrowPosBefore.y1 = arrow.y1;
      arrowPosBefore.x2 = arrow.x2;
      arrowPosBefore.y2 = arrow.y2;
    },
    (dx, dy) => {
      if (movingStart) {
        arrow.x1 = arrowPosBefore.x1 + dx;
        arrow.y1 = arrowPosBefore.y1 + dy;
        dispatchEvent(new CustomEvent("arrowMove", {
          detail: {
            x: arrow.positionX1,
            y: arrow.positionY1,
            index,
            pos: "front"
          }
        }));
      } else if (movingEnd) {
        arrow.x2 = arrowPosBefore.x2 + dx;
        arrow.y2 = arrowPosBefore.y2 + dy;
        dispatchEvent(new CustomEvent("arrowMove", {
          detail: {
            x: arrow.positionX2,
            y: arrow.positionY2,
            index,
            pos: "end"
          }
        }));
      } else {
        arrow.x1 = arrowPosBefore.x1 + dx;
        arrow.y1 = arrowPosBefore.y1 + dy;
        arrow.x2 = arrowPosBefore.x2 + dx;
        arrow.y2 = arrowPosBefore.y2 + dy;
      }
    });

  $effect(() => {
    if (moveArrow.isDragging === false) {
      movingStart = false;
      movingEnd = false;
    }
  })

  let arrowSnapped = $state({start: null, end: null});
  // should make circle "source of truth" for position of start and end when snapped
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
          markerWidth="{arrow.widthWithScale.marker}"
          markerHeight="{arrow.widthWithScale.marker}"
          orient="auto-start-reverse" viewBox="0 0 10 10">
    <path fill="{arrow.color.toHex()}" d="M 0 0 L 10 5 L 0 10 z"/>
  </marker>

  <marker id="end{index}" refX="{5}" refY="{5}"
          markerWidth="{arrow.widthWithScale.marker}"
          markerHeight="{arrow.widthWithScale.marker}"
          orient="auto-start-reverse">
    <!-- put other arrow options for ending (as well as front)   -->
  </marker>
</defs>

<line
  transition:scale={{duration: 120}}
  style="transform-origin: {(arrow.positionX1 + arrow.positionX2) / 2}px {(arrow.positionY1 + arrow.positionY2) / 2}px;"
  onmousedown="{moveArrow.setDrag}"
  x1={arrow.positionX1}
  y1={arrow.positionY1}
  x2={arrow.positionX2}
  y2={arrow.positionY2}
  stroke="{arrow.color.toHex()}"
  stroke-width={arrow.widthWithScale.line}
  marker-end="url(#arrowHead{index})"
  marker-start="url(#end{index})"
  role="presentation"></line>

{#if arrow.selected}

  {#snippet draggableCircle(cx, cy, setMoving)}
    <circle
      transition:fade={{duration: 120}}
      style="transform-origin: {(arrow.positionX1 + arrow.positionX2) / 2}px {(arrow.positionY1 + arrow.positionY2) / 2}px;"
      {cx} {cy}
      onmousedown={(event) => {
        moveArrow.setDrag(event)
        setMoving()
      }}
      r="4"
      fill="white"
      stroke="black"
      role="presentation"></circle>
  {/snippet}

  {@render draggableCircle(arrow.positionX1, arrow.positionY1, () => movingStart = true)}
  {@render draggableCircle(arrow.positionX2, arrow.positionY2, () => movingEnd = true)}

  <Popup x={((arrow.positionX1 + arrow.positionX2) / 2)}
         y={((arrow.positionY1 + arrow.positionY2) / 2) - 55}
         bind:shape={arrow}
         removeShape={removeArrow}
         isDragging={moveArrow.isDragging}/>
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