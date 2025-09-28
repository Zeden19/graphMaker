<script>
  import {scale} from "svelte/transition";

  let {selected, text, shape = $bindable(), x, y, width, height, containerStyles, ...foreignObjectProps} = $props();

</script>

<foreignObject {x} {y} {width} {height} {...foreignObjectProps}>
  <div class="container" style="{containerStyles}">
    <div transition:scale|global={{duration: 120}} draggable="false"
         contenteditable
         onclick="{() => shape && (shape.isEditing = true)}"
         onblur="{() => shape && (shape.isEditing = false)}"
         bind:innerHTML={text.value}
         style="
           font-size:{text.fontSize}px;
           pointer-events:{selected ? 'auto' : ''};
           color: {text.color.toHex()};
           font-weight: {text.bold ? 'bold' : ''};
           text-decoration: {text.underline ? 'underline' : ''};
           font-style: {text.italic ? 'italic' : ''};
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
    overflow: scroll;
    height: 100%;
    width: 100%;
  }
</style>