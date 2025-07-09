<script>
  import {scale, fade} from "svelte/transition";
  import Popup from "./Popup.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";
  import {onMount} from "svelte";

  const areaSize = 20;

  let {arrow = $bindable(), removeArrow, index, circles, offset} = $props();

  let arrowPosBefore = {x1: 0, y1: 0, x2: 0, y2: 0};

  let movingStart = $state();
  let movingEnd = $state();

  // to fix arrow incorrect position, maybe make x and y derived variables
  // this code sucks actually dick but fixing it would be a pain since state management is fucked
  // will fix later
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

        if (!(arrow.x1 < arrow.positionX1 + areaSize && arrow.x1 > arrow.positionX1 - areaSize) ||
          !(arrow.y1 < arrow.positionY1 + areaSize && arrow.y1 > arrow.positionY1 - areaSize)) {
          arrow.startSnapped = null;
        }

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

        if (!(arrow.x2 < arrow.positionX2 + areaSize && arrow.x2 > arrow.positionX2 - areaSize) ||
          !(arrow.y2 < arrow.positionY2 + areaSize && arrow.y2 > arrow.positionY2 - areaSize)) {
          arrow.endSnapped = null;
        }

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

  onMount(() => {
    window.addEventListener(`arrowSnap${index}`, ({detail: {index: circleIndex, location, pos}}) => {
      // need to  function to prevent detach unless you scroll or click arrow (idk)
      if (pos === "front") {
        arrow.startSnapped = () => circles[circleIndex]?.circleRect.basic[location];
      } else if (pos === "end") {
        arrow.endSnapped = () => circles[circleIndex]?.circleRect.basic[location];
      }
    });

    window.addEventListener(`circleDelete${index}`, () => {
      console.log("circleDelete")
      arrow.startSnapped = null;
      arrow.endSnapped = null;
    })
  });

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