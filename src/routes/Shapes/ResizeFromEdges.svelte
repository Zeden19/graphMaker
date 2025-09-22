<script>
  import ResizeCircle from "./ResizeCircle.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";

  let {shape} = $props();

  let cornerResizes = $derived(Object.values(shape.rect).map((corner) => {
    let sizeBefore = $state({width: shape.width, height: shape.height})
    let resize = new DraggableObject(
      () => {
        shape.isEditing = true;
        sizeBefore.width = shape.width;
        sizeBefore.height = shape.height;
      },
      (dx, dy) => {
        corner.changeSizeFnc(dx, dy, sizeBefore.width, sizeBefore.height);
      },
      () => {
        shape.isEditing = false;
      })
    return {setDrag: resize.setDrag, ...corner}
  }));
</script>

{#if shape.selected}
  {#each cornerResizes as cornerResize}
    <ResizeCircle x={cornerResize.x} y={cornerResize.y} cursor={cornerResize.cursor}
                  setDrag={cornerResize.setDrag}/>
  {/each}
{/if}