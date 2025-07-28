<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";
  import SquareResize from "./SquareResize.svelte";

  let {square, removeSquare} = $props();
</script>

<rect
  transition:scale={{duration: 120}}
  style="transform-origin: {square.position.x}px {square.position.y}px;"
  x="{square.position.x}"
  y="{square.position.y}"
  width="{square.widthWithScale}"
  height="{square.heightWithScale}"
  fill="{square.color.toHex()}"
  onmousedown="{square.setDrag}"
  stroke="{square.strokeColor.toHex()}"
  stroke-width="{square.strokeWidth}"
  role="presentation"></rect>

<foreignObject style="pointer-events: none"
               x={square.position.x} y={square.position.y}
               width={square.widthWithScale} height={square.heightWithScale}
>
  <ShapeText selected={square.selected} text={square.text}></ShapeText>
</foreignObject>

{#if square.selected}
  {#each Object.values(square.rect) as corner}
    <SquareResize square={square} x={corner.x} y={corner.y}
                  changeSizeFnc={corner.changeSizeFnc}
                  cursor={corner.cursor}/>
  {/each}
{/if}

<style>
  rect {
    cursor: grab;
    transition: fill var(--shape-transition-timing), stroke var(--shape-transition-timing);
  }
</style>
