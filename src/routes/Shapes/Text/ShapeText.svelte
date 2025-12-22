<script>
  import {scale} from "svelte/transition";

  let {shape = $bindable(), x, y, transformOrigin, width, height, containerStyles} = $props();

</script>

<foreignObject {x} {y} {width} {height} style="transform: rotate({shape.rotation}deg);
transform-origin: {transformOrigin.x}px {transformOrigin.y}px;">
  <div class="container" style="{containerStyles}">
    <div transition:scale|global={{duration: 120}} draggable="false"
         contenteditable
         onclick="{() => shape && (shape.isEditing = true)}"
         onblur="{() => shape && (shape.isEditing = false)}"
         bind:innerHTML={shape.text.value}
         style="
           font-size:{shape.text.fontSize}px;
           pointer-events:{shape.selected ? 'auto' : ''};
           color: {shape.text.color};
           font-weight: {shape.text.bold ? 'bold' : ''};
           text-decoration: shape.{shape.text.underline ? 'underline' : ''};
           font-style: {shape.text.italic ? 'italic' : ''};
           width: fit-content;
           height: fit-content;
           overflow-wrap: anywhere;"
         role="presentation"></div>
  </div>
</foreignObject>

<style>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    overflow-wrap: normal;
    height: 100%;
    width: 100%;
  }
</style>