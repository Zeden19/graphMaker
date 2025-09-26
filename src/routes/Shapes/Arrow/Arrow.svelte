<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";
  import ResizeCircle from "../ResizeCircle.svelte";

  let {arrow = $bindable(), index} = $props();

  const arrowEndPoints = {
    arrow: `<path fill="${arrow.color.toHex()}" d="M 0 0 L 10 5 L 0 10 z"/>`,
    circle: `<circle r="${arrow.widthWithScale.marker}" fill="${arrow.color.toHex()}" cx="5" cy="5"></circle>`,
    square: `<rect x="0.5" y="0.5" width="${arrow.widthWithScale.marker + 5}" height="${arrow.widthWithScale.marker + 5}"
                        fill="${arrow.color.toHex()}"></rect>`,
    line: `<line stroke-width="${arrow.widthWithScale.marker}" stroke="${arrow.color.toHex()}"
                        x1="5" y1="0" x2="5" y2="10"></line>`
  };

  $effect(() => {
    if (arrow.drag.isDragging === false) {
      arrow.movingStart = false;
      arrow.movingEnd = false;
    }
  });

  const textWidth = $derived(Math.min(arrow.text.value.length * arrow.text.fontSize * 0.6, arrow.length));

  const textOffset = 25;

  const textPos = $derived({
    x: arrow.middle.x + Math.sin(arrow.rotation) * textOffset - Math.cos(arrow.rotation) * (textWidth / 2),
    y: arrow.middle.y - Math.cos(arrow.rotation) * textOffset - Math.sin(arrow.rotation) * (textWidth / 2)
  });

</script>

<defs>
  <marker id="start{index}" refX="{5}" refY="{5}"
          markerWidth="{arrow.widthWithScale.marker}"
          markerHeight="{arrow.widthWithScale.marker}"
          orient="auto-start-reverse" viewBox="0 0 10 10">
    {@html arrowEndPoints[arrow.start]}
  </marker>

  <marker id="end{index}" refX="{5}" refY="{5}"
          markerWidth="{arrow.widthWithScale.marker}"
          markerHeight="{arrow.widthWithScale.marker}"
          orient="auto-start-reverse" viewBox="0 0 10 10">
    {@html arrowEndPoints[arrow.end]}
  </marker>
</defs>

<ShapeText
  selected={arrow.selected}
  text={arrow.text}
  shape={arrow}
  x={textPos.x}
  y={textPos.y}
  style="
  overflow-wrap: normal;
    transform: rotate({arrow.rotation}rad);
    transform-origin: {textPos.x}px {textPos.y}px;"
  width="{textWidth}px"
  height="1.5em"
/>

<!--use path instead for stroke (& will be useful for curved shit)-->
<polyline
  transition:scale|global={{duration: 120}}
  points="{arrow.position.x1},{arrow.position.y1} {arrow.position.x2},{arrow.position.y2}"
  style="transform-origin: {arrow.middle.x}px {arrow.middle.y}px;"
  stroke="{arrow.color.toHex()}"
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