<script>
  import {arrowEndpoints} from "$lib/arrowEndpoints.js";
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";
  import ResizeCircle from "../ResizeCircle.svelte";

  let {arrow = $bindable()} = $props();

  $effect(() => {
    if (arrow.drag.isDragging === false) {
      arrow.movingStart = false;
      arrow.movingEnd = false;
    }
  });

  const textPos = $derived.by(() => {
    const offset = (arrow.width / 2) + arrow.strokeWidth + 5;
    return {
      x: arrow.position.x1 + arrow.unitVectors.perp.x * offset,
      y: arrow.position.y1 + arrow.unitVectors.perp.y * offset
    };
  });

  const path = $derived.by(() => {
    const hw = arrow.width / 2;
    const coords = {
      x1: arrow.position.x1 + arrow.unitVectors.perp.x * hw,
      y1: arrow.position.y1 + arrow.unitVectors.perp.y * hw,
      x2: arrow.position.x2 + arrow.unitVectors.perp.x * hw,
      y2: arrow.position.y2 + arrow.unitVectors.perp.y * hw,
      x3: arrow.position.x2 - arrow.unitVectors.perp.x * hw,
      y3: arrow.position.y2 - arrow.unitVectors.perp.y * hw,
      x4: arrow.position.x1 - arrow.unitVectors.perp.x * hw,
      y4: arrow.position.y1 - arrow.unitVectors.perp.y * hw,
    }
    const {x1, y1, x2, y2, x3, y3, x4, y4} = coords;

    return `
          M ${x1},${y1} L ${x2},${y2}
          L ${x3},${y3} L ${x4},${y4} Z

          ${arrowEndpoints[arrow.start](arrow, true, coords)}
          ${arrowEndpoints[arrow.end](arrow, false, coords)}
          `
  });
</script>

<ShapeText
  shape={arrow}
  x={textPos.x}
  y={textPos.y}
  transformOrigin={{x: textPos.x, y: textPos.y}}
  width="{arrow.length}px"
  height="1.5em"
/>

<path
  transition:scale|global={{duration: 120}}
  d="{path}"
  style="transform-origin: {arrow.middle.x}px {arrow.middle.y}px;"
  fill="{arrow.color}"
  stroke="{arrow.strokeColor}"
  stroke-width="{arrow.strokeWidth * 2}"
>
</path>

{#if arrow.selected}
  <ResizeCircle
    x={arrow.points.start.x}
    y={arrow.points.start.y}
    cursor="move"
    setDrag={(event) => {arrow.setDrag(event); arrow.movingStart = true;}}
  />

  <ResizeCircle
    x={arrow.points.end.x}
    y={arrow.points.end.y}
    cursor="move"
    setDrag={(event) => {arrow.setDrag(event); arrow.movingEnd = true;}}
  />
{/if}