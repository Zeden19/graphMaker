<script>
  import { scale } from "svelte/transition";
  let {text = $bindable(), offset} = $props();
</script>

<foreignObject onmousedown={text.setDrag}
               x="{text.position.x}" y="{text.position.y}" width="{text.width}" height="1" role="presentation">
  <div contenteditable="true" transition:scale={{duration: 130}}
       style="
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
</style>