<script>
  import {scale} from "svelte/transition";

  let {text = $bindable()} = $props();
  let textStyles = $derived(text.text)

  const PADDING = 5;
  let textRef = $state();
</script>

<foreignObject onmousedown={text.setDrag}
               x="{text.position.x}" y="{text.position.y}"
               width="{text.width}" height="{text.height}" role="presentation">
  <div contenteditable="true" transition:scale={{duration: 130}} draggable="false"
       bind:this={textRef}
       style="
       padding: {PADDING}px;
       width: calc(100%) - {PADDING * 2}px;
       height: calc({text.height}px - {PADDING * 2}px);
       transform-origin: {text.position.x}px {text.position.y}px;
       font-size:{textStyles.fontSize}px;
       color: {textStyles.color.toHex()};
       font-weight: {textStyles.bold ? 'bold' : ''};
       text-decoration: {textStyles.underline ? 'underline' : ''};
       font-style: {textStyles.italic ? 'italic' : ''};">
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