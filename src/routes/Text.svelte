<script>
  import {scale} from "svelte/transition";

  let {fontSize, color, selected, onmousedown, textContainer = $bindable()} = $props();
  console.log(textContainer)
</script>

<div class="text-container" draggable="false" bind:this={textContainer} transition:scale={{duration: 120}}>
  <div class="no-select circle-text" contenteditable onmousedown={(event) => onmousedown ? onmousedown(event) : null}
       style="font-size:{fontSize}em; pointer-events:{selected ? 'auto' : ''}; color: {color};"
       role="presentation">
    Text here
  </div>
</div>

<style>
  .text-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .circle-text {
    min-width: 0;
    text-align: center;
  }
</style>