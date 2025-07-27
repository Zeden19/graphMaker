<script>
  import {scale, fade} from "svelte/transition";
  import DraggableObject, {DraggableShape} from "./DraggableObject.svelte.js";
  import {onMount} from "svelte";
  import ShapeText from "./Text/ShapeText.svelte";

  const areaSize = 20;

  let {arrow = $bindable(), removeArrow, index, offset} = $props();

  let arrowPosBefore = {x1: 0, y1: 0, x2: 0, y2: 0};
  let movingStart = $state();
  let movingEnd = $state();

  const moveCorner = (x, y, dx, dy, cornerSnappedVar, posString) => {
    arrow[x] = arrowPosBefore[x] + dx;
    arrow[y] = arrowPosBefore[y] + dy;

    if (!(arrow[x] < arrow.position[x] + areaSize && arrow[x] > arrow.position[x] - areaSize) ||
      !(arrow[y] < arrow.position[y] + areaSize && arrow[y] > arrow.position[y] - areaSize)) {
      arrow[cornerSnappedVar] = null;
    }

    dispatchEvent(new CustomEvent("arrowMove", {
      detail: {
        x: arrow.position[x],
        y: arrow.position[y],
        index,
        pos: posString
      }
    }));
  }
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
        moveCorner("x1", "y1", dx, dy, "startSnapped", "start")
      } else if (movingEnd) {
        moveCorner("x2", "y2", dx, dy, "endSnapped", "end")
      } else {
        arrow.x1 = arrowPosBefore.x1 + dx;
        arrow.y1 = arrowPosBefore.y1 + dy;
        arrow.x2 = arrowPosBefore.x2 + dx;
        arrow.y2 = arrowPosBefore.y2 + dy;

        arrow.startSnapped = null;
        arrow.endSnapped = null;
      }
    });

  $effect(() => {
    if (moveArrow.isDragging === false) {
      movingStart = false;
      movingEnd = false;
    }

    if (arrow.startSnapped) {
      arrow.x1 = arrow.startSnapped().x - offset.x;
      arrow.y1 = arrow.startSnapped().y - offset.y;
    }

    if (arrow.endSnapped) {
      arrow.x2 = arrow.endSnapped().x - offset.x;
      arrow.y2 = arrow.endSnapped().y - offset.y;
    }
  });

  onMount(() => {
    const snapArrow = ({detail: {pos, circleRef}}) => {
      if (pos === "start") {
        arrow.startSnapped = circleRef;
      } else if (pos === "end") {
        arrow.endSnapped = circleRef;
      }
    }

    const onCircleDelete = ({detail: {pos}}) => {
      if (pos === "start") {
        arrow.startSnapped = null;
      } else if (pos === "end") {
        arrow.endSnapped = null;
      }
    }

    window.addEventListener(`arrowSnap${index}`, snapArrow);
    window.addEventListener(`circleDelete${index}`, onCircleDelete);

    return () => {
      window.removeEventListener(`arrowSnap${index}`, snapArrow);
      window.removeEventListener(`circleDelete${index}`, onCircleDelete);
    }
  });

  let textOffset = $state({x: 0, y: 0});

  const determineTextPos = (min, x, max) => {
    if (x < min) return min;
    if (x > max) return max;
    else return x;
  }
  let textPosition = $derived.by(() => {
      const cos = Math.cos(arrow.rotation);
      const sin = Math.sin(arrow.rotation);
      const boundaryOffset = Math.abs(cos) * (arrow.length / 2) + Math.abs(sin) * 5;
      const verticalOffset = Math.abs(sin) * (arrow.length / 2) + Math.abs(cos) * 5;
      return arrow.position.x2 >= arrow.position.x1 ?
        {
          x: determineTextPos(
            arrow.position.x1 - boundaryOffset,
            arrow.position.x1 + textOffset.x,
            arrow.position.x1 + boundaryOffset),
          y: determineTextPos(
            arrow.position.y1 - verticalOffset,
            arrow.position.y1 + textOffset.y,
            arrow.position.y1 + verticalOffset)
        } :
        {
          x: determineTextPos(
            arrow.position.x2 - arrow.length / 2,
            arrow.position.x2 + textOffset.x,
            arrow.position.x2 + arrow.length / 2),
          y: determineTextPos(
            arrow.position.y2 - 5,
            arrow.position.y2 + textOffset.y,
            arrow.position.y2 + 5)
        }
    }
  );

  let moveText = new DraggableShape(() => textOffset);
</script>

<defs>
  <marker id="start{index}" refX="{5}" refY="{5}"
          markerWidth="{arrow.widthWithScale.marker}"
          markerHeight="{arrow.widthWithScale.marker}"
          orient="auto-start-reverse" viewBox="0 0 10 10">
    {@html arrow.start}
  </marker>

  <marker id="end{index}" refX="{5}" refY="{5}"
          markerWidth="{arrow.widthWithScale.marker}"
          markerHeight="{arrow.widthWithScale.marker}"
          orient="auto-start-reverse" viewBox="0 0 10 10">
    {@html arrow.end}
  </marker>
</defs>

<foreignObject x={textPosition.x}
               y={textPosition.y}
               style="overflow:visible; transform: rotate({arrow.rotation}rad);
                transform-origin: {textPosition.x}px
                                  {textPosition.y}px;"
               width="{arrow.length}" height="2em">

  <ShapeText selected={arrow.selected} text={arrow.text}
             onmousedown={(event) => {arrow.selected = true; moveText.setDrag(event)}}/>
</foreignObject>

<!--use path instead for stroke (& will be useful for curved shit)-->
<polyline
  transition:scale={{duration: 120}}
  points="{arrow.position.x1},{arrow.position.y1} {arrow.position.x2},{arrow.position.y2}"
  style="transform-origin: {arrow.middle.x}px {arrow.middle.y}px;"
  onmousedown="{moveArrow.setDrag}"
  stroke="{arrow.color.toHex()}"
  stroke-width="{arrow.width}"
  marker-end="url(#end{index})"
  marker-start="url(#start{index})"
  role="presentation"></polyline>


{#if arrow.selected}
  {#snippet draggableCircle(cx, cy, setMoving)}
    <circle
      transition:fade={{duration: 120}}
      style="transform-origin: {arrow.middle.x}px {arrow.middle.y}px;"
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

  {@render draggableCircle(arrow.position.x1, arrow.position.y1, () => movingStart = true)}
  {@render draggableCircle(arrow.position.x2, arrow.position.y2, () => movingEnd = true)}
{/if}


<style>
  polyline {
    cursor: pointer;
    transition: stroke var(--shape-transition-timing);
  }

  circle {
    cursor: grab;
  }
</style>