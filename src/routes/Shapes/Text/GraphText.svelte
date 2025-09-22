<script>
  import {scale} from "svelte/transition";

  let {text = $bindable()} = $props();
  let textStyles = $derived(text?.text);

  const PADDING = 5;
  let textRef = $state();


</script>

<!--todo fix deselecting when clicking on empty space, make the content editable portion only the size of the text-->
<foreignObject
  x="{text.position.x}" y="{text.position.y}"
  width="{text.width}" height="{text.height}">
  <div contenteditable="true" transition:scale={{duration: 130}} draggable="false"
       bind:this={textRef} bind:innerHTML={textStyles.value}
       onclick="{() => text.isEditing = true}"
       onblur="{() => text.isEditing = false}"
       style="
       padding: {PADDING}px;
       width: calc(100%) - {PADDING * 2}px;
       height: calc({text.height}px - {PADDING * 2}px);
       transform-origin: {text.position.x}px {text.position.y}px;
       font-size:{textStyles.fontSize}px;
       color: {textStyles.color.toHex()};
       font-weight: {textStyles.bold ? 'bold' : ''};
       text-decoration: {textStyles.underline ? 'underline' : ''};
       font-style: {textStyles.italic ? 'italic' : ''};"
       role="presentation">
    Text
  </div>

</foreignObject>

<style>
  foreignObject {
    overflow: visible;
  }

  div {
    overflow: hidden;
    white-space: break-spaces;
  }
</style>