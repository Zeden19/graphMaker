<script>
  import {scale} from "svelte/transition";

  let {selected, onmousedown = () => "", text, ...foreignObjectProps} = $props();

  let contenteditable = $state(false);
  let textRef = $state();
</script>

<foreignObject {...foreignObjectProps}>
  <div transition:scale={{duration: 120}} class="no-select text" draggable="false"
       contenteditable
       bind:this={textRef}
       {onmousedown}
       bind:innerHTML={text.value}
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
</foreignObject>

<style>
  .text {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    white-space: break-spaces;
    overflow: auto;
  }
</style>