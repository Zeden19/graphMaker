<script>
  import {scale} from "svelte/transition";

  let {selected, text, shape = $bindable(), ...foreignObjectProps} = $props();

  let textRef = $state();
</script>

<foreignObject {...foreignObjectProps}>
  <div transition:scale|global={{duration: 120}} class="no-select text" draggable="false"
       contenteditable
       onclick="{() => shape && (shape.isEditing = true)}"
       onblur="{() => shape && (shape.isEditing = false)}"
       bind:this={textRef}
       bind:innerHTML={text.value}
       style="
           font-size:{text.fontSize}px;
           pointer-events:{selected ? 'auto' : ''};
           color: {text.color.toHex()};
           font-weight: {text.bold ? 'bold' : ''};
           text-decoration: {text.underline ? 'underline' : ''};
           font-style: {text.italic ? 'italic' : ''};"
       role="presentation"
  >
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