<script>
  import {arrowEndpoints} from "$lib/arrowEndpoints.js";
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";
  import ResizeCircle from "./ResizeCircle.svelte";

  let {arrow = $bindable()} = $props();

  $effect(() => {
    if (arrow.drag.isDragging === false) {
      arrow.movingStart = false;
      arrow.movingEnd = false;
      arrow.movingCurveControl = false;
    }
  });

  const curve = $derived.by(() => ({
    start: {x: arrow.position.x1, y: arrow.position.y1},
    end: {x: arrow.position.x2, y: arrow.position.y2},
    curveControl: arrow.curveControl,
    bezierControl: arrow.bezierControl
  }));

  const textSize = $derived.by(() => ({
    width: arrow.length,
    height: arrow.text.fontSize * 1.5
  }));

  const textPos = $derived.by(() => {
    const offset = (textSize.height / 2) + (arrow.width / 2) + arrow.strokeWidth + 6;
    return {
      x: (arrow.curveMiddle.x + arrow.curveTangent.perp.x * offset) - (textSize.width / 2),
      y: (arrow.curveMiddle.y + arrow.curveTangent.perp.y * offset) - (textSize.height / 2)
    };
  });

  const textRotation = $derived.by(() => {
    return Math.atan2(arrow.curveTangent.dir.y, arrow.curveTangent.dir.x) * (180 / Math.PI);
  });

  const shaftPath = $derived.by(() => {
    return `M ${curve.start.x},${curve.start.y} Q ${curve.bezierControl.x},${curve.bezierControl.y} ${curve.end.x},${curve.end.y}`;
  });

  const coords = $derived.by(() => {
    const hw = arrow.width / 2;
    const startVectors = arrow.getEndpointVectors(true);
    const endVectors = arrow.getEndpointVectors(false);
    return {
      x1: curve.start.x + startVectors.perp.x * hw,
      y1: curve.start.y + startVectors.perp.y * hw,
      x2: curve.end.x + endVectors.perp.x * hw,
      y2: curve.end.y + endVectors.perp.y * hw,
      x3: curve.end.x - endVectors.perp.x * hw,
      y3: curve.end.y - endVectors.perp.y * hw,
      x4: curve.start.x - startVectors.perp.x * hw,
      y4: curve.start.y - startVectors.perp.y * hw
    };
  });

  const endpoints = $derived.by(() => {
    return `
      ${arrowEndpoints[arrow.start](arrow, true, coords)}
      ${arrowEndpoints[arrow.end](arrow, false, coords)}
    `;
  });

  const capPath = $derived.by(() => {
    const halfWidth = arrow.width / 2;
    const parts = [];
    if (arrow.start === "") {
      const perp = arrow.getEndpointVectors(true).perp;
      const a = {x: curve.start.x - perp.x * halfWidth, y: curve.start.y - perp.y * halfWidth};
      const b = {x: curve.start.x + perp.x * halfWidth, y: curve.start.y + perp.y * halfWidth};
      parts.push(`M ${a.x} ${a.y} L ${b.x} ${b.y}`);
    }
    if (arrow.end === "") {
      const perp = arrow.getEndpointVectors(false).perp;
      const a = {x: curve.end.x - perp.x * halfWidth, y: curve.end.y - perp.y * halfWidth};
      const b = {x: curve.end.x + perp.x * halfWidth, y: curve.end.y + perp.y * halfWidth};
      parts.push(`M ${a.x} ${a.y} L ${b.x} ${b.y}`);
    }
    return parts.join(" ");
  });
</script>

<ShapeText
  shape={arrow}
  x={textPos.x}
  y={textPos.y}
  transformOrigin={{x: arrow.curveMiddle.x, y: arrow.curveMiddle.y}}
  width="{textSize.width}px"
  height="{textSize.height}px"
  rotation={textRotation}
/>

<path
  transition:scale|global={{duration: 120}}
  d="{shaftPath}"
  fill="none"
  stroke="{arrow.strokeColor}"
  stroke-width="{arrow.width + arrow.strokeWidth * 2}"
  style="stroke-dasharray: {arrow.strokeStyle};"
/>

<!--Main arrow-->
<path
  transition:scale|global={{duration: 120}}
  d="{shaftPath}"
  fill="none"
  stroke="{arrow.color}"
  stroke-width="{arrow.width}"
/>

{#if capPath}
  <path
    transition:scale|global={{duration: 120}}
    d="{capPath}"
    fill="none"
    stroke="{arrow.strokeColor}"
    stroke-width="{arrow.strokeWidth * 2}"
    stroke-linecap="butt"
  />
{/if}

<!--Endpoints Path-->
<path
  transition:scale|global={{duration: 120}}
  d="{endpoints}"
  fill="{arrow.color}"
  stroke="{arrow.strokeColor}"
  stroke-width="{arrow.strokeWidth * 2}"
  style="stroke-dasharray: {arrow.strokeStyle};"
/>

{#if arrow.selected}
  <ResizeCircle
    x={arrow.points.start.x}
    y={arrow.points.start.y}
    setDrag={arrow.setDrag}
    moving={() => arrow.movingStart = true}
  />

  <ResizeCircle
    x={arrow.points.end.x}
    y={arrow.points.end.y}
    setDrag={arrow.setDrag}
    moving={() => arrow.movingEnd = true}
  />

  <ResizeCircle
    x={arrow.curveControl.x}
    y={arrow.curveControl.y}
    setDrag={arrow.setDrag}
    moving={() => arrow.movingCurveControl = true}
  />
{/if}
