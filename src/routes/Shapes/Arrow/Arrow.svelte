<script>
  import {arrowEndpoints} from "$lib/arrowEndpoints.js";
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";
  import ResizeCircle from "../ResizeCircle.svelte";

  let {arrow = $bindable(), index} = $props();

  $effect(() => {
    if (arrow.drag.isDragging === false) {
      arrow.movingStart = false;
      arrow.movingEnd = false;
    }
  });

  const textPos = $derived.by(() => {
    const dx = arrow.points.end.x - arrow.points.start.x;
    const dy = arrow.points.end.y - arrow.points.start.y;
    const L = Math.sqrt(dx * dx + dy * dy);

    const nX = -dy / L;
    const nY = dx / L;

    const offsetX = nX * 10;
    const offsetY = nY * 10;

    return {x: offsetX + arrow.points.start.x, y: offsetY + arrow.points.start.y};

  });
</script>

<defs>
  <marker id="start{index}" refX="{5}" refY="{5}"
          markerWidth="{arrow.widthWithScale.marker}"
          markerHeight="{arrow.widthWithScale.marker}"
          orient="auto-start-reverse" viewBox="0 0 10 10">
    {@html arrowEndpoints[arrow.start](arrow)}
  </marker>

  <marker id="end{index}" refX="{5}" refY="{5}"
          markerWidth="{arrow.widthWithScale.marker}"
          markerHeight="{arrow.widthWithScale.marker}"
          orient="auto-start-reverse" viewBox="0 0 10 10">
    {@html arrowEndpoints[arrow.end](arrow)}
  </marker>
</defs>

<ShapeText
  shape={arrow}
  x={textPos.x}
  y={textPos.y}
  transformOrigin={{x: textPos.x, y: textPos.y}}
  width="{arrow.length}px"
  height="1.5em"
/>

<!--use path instead for stroke (& will be useful for curved shit)-->
<polyline
  transition:scale|global={{duration: 120}}
  points="{arrow.position.x1},{arrow.position.y1} {arrow.position.x2},{arrow.position.y2}"
  style="transform-origin: {arrow.middle.x}px {arrow.middle.y}px;"
  stroke="{arrow.color}"
  stroke-width="{arrow.width}"
  marker-end="url(#end{index})"
  marker-start="url(#start{index})">
</polyline>

{#if arrow.selected}
  <ResizeCircle
    x={arrow.position.x1}
    y={arrow.position.y1}
    cursor="move"
    setDrag={(event) => {arrow.setDrag(event); arrow.movingStart = true;}}
  />

  <ResizeCircle
    x={arrow.position.x2}
    y={arrow.position.y2}
    cursor="move"
    setDrag={(event) => {arrow.setDrag(event); arrow.movingEnd = true;}}
  />
{/if}

<style>
  polyline {
    cursor: pointer;
    transition: stroke var(--shape-transition-timing);
  }
</style>