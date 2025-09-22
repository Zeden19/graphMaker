<script>
  import {scale} from "svelte/transition";
  import {DraggableShape} from "../DraggableObject.svelte.js";
  import {onMount} from "svelte";
  import ShapeText from "../Text/ShapeText.svelte";
  import ResizeCircle from "../ResizeCircle.svelte";

  let {arrow = $bindable(), removeArrow, index, offset} = $props();

  $effect(() => {
    if (arrow.drag.isDragging === false) {
      arrow.movingStart = false;
      arrow.movingEnd = false;
    }
  });

  onMount(() => {
    const moveArrow = ({detail: {pos, ref}}) => {
      if (pos === "start") {
        arrow.x1 = ref().x - offset.x;
        arrow.y1 = ref().y - offset.y;
      } else if (pos === "end") {
        arrow.x2 = ref().x - offset.x;
        arrow.y2 = ref().y - offset.y;
      }
    }

    window.addEventListener(`moveArrow${index}`, moveArrow);

    return () => {
      window.removeEventListener(`moveArrow${index}`, moveArrow);
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

  let moveText = new DraggableShape(textOffset);

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


<ShapeText selected={arrow.selected} text={arrow.text} shape={arrow}
           onmousedown={(event) => {arrow.selected = true; moveText.setDrag(event)}}
           x={textPosition.x} y={textPosition.y}
           style="overflow:visible;
           transform: rotate({arrow.rotation}rad);
                      transform-origin: {textPosition.x}px
                                        {textPosition.y}px;"
           width={arrow.length} height="1.5em"/>

<!--use path instead for stroke (& will be useful for curved shit)-->
<polyline
  transition:scale={{duration: 120}}
  points="{arrow.position.x1},{arrow.position.y1} {arrow.position.x2},{arrow.position.y2}"
  style="transform-origin: {arrow.middle.x}px {arrow.middle.y}px;"
  stroke="{arrow.color.toHex()}"
  stroke-width="{arrow.width}"
  marker-end="url(#end{index})"
  marker-start="url(#start{index})"></polyline>


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