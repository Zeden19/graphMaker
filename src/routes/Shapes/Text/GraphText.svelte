<script>
  import {scale} from "svelte/transition";

  let {text = $bindable()} = $props();

  let textStyles = $derived(text?.text);
  let textRef = $state();
</script>

<foreignObject
  x="{text.position.x}" y="{text.position.y}"
  width="{text.widthWithScale}" height="{text.heightWithScale}">
  <div class="container">
    <div contenteditable="true" transition:scale|global={{duration: 130}} draggable="false"
         bind:this={textRef} bind:innerHTML={textStyles.value}
         onclick="{() => text.isEditing = true}"
         onblur="{() => text.isEditing = false}"
         style="
       padding: 5px;
       width: fit-content;
       height: fit-content;
       transform-origin: {text.position.x}px {text.position.y}px;
       outline: {text.strokeColor.toHex()} {text.strokeWidth}px solid;
       font-size:{textStyles.fontSize}px;
       color: {textStyles.color.toHex()};
       font-weight: {textStyles.bold ? 'bold' : ''};
       text-decoration: {textStyles.underline ? 'underline' : ''};
       font-style: {textStyles.italic ? 'italic' : ''};
       "
         role="presentation">
      Text
    </div>
  </div>
</foreignObject>


<style>

  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: scroll;
    height: 100%
  }

  foreignObject {
    overflow: visible;
  }

  div {
    overflow: hidden;
    white-space: break-spaces;
  }
</style>