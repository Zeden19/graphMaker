<script>
  import {scale} from "svelte/transition";

  let {text = $bindable()} = $props();

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
       font-size:{text.fontSize}px;
       color: {text.color.toHex()};
       font-weight: {text.bold ? 'bold' : ''};
       text-decoration: {text.underline ? 'underline' : ''};
       font-style: {text.italic ? 'italic' : ''};">
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