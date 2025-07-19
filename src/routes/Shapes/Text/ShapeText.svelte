<script>
  import {scale} from "svelte/transition";

  let {selected, onmousedown, text} = $props();

  let contenteditable = $state(false);
  let textRef = $state();

</script>

<div class="text-container" transition:scale={{duration: 120}}>
  <div class="no-select text" draggable="false" {contenteditable} bind:this={textRef}
       onfocus={() => contenteditable = true}
       onmouseover={() => contenteditable = true}
       onmouseleave={() => {
         if (!(document.activeElement === textRef)) contenteditable = false
       }}
       onmousedown={(event) => {
         onmousedown ? onmousedown(event) : "";
       }}
       style="
       font-size:{text.fontSize}px;
       pointer-events:{selected ? 'auto' : ''};
       color: {text.color.toHex()};
       font-weight: {text.bold ? 'bold' : ''};
       text-decoration: {text.underline ? 'underline' : ''};
       font-style: {text.italic ? 'italic' : ''};"
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

  .text {
    min-width: 0;
    text-align: center;
    position: relative;
  }
</style>