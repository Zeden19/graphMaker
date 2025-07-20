<script>
  import { scale } from "svelte/transition";
  import DraggableObject from "../DraggableObject.svelte.js";

  let {text = $bindable(), offset} = $props();

  let textPosBefore = $state({x: 0, y: 0})
  let moveText = new DraggableObject(
    () => {
      text.selected = true;
      textPosBefore.x = text.x;
      textPosBefore.y = text.y;
    },
    (dx, dy) => {
      text.x = textPosBefore.x + dx;
      text.y = textPosBefore.y + dy;
    })
</script>

<foreignObject onmousedown={moveText.setDrag}
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