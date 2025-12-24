<script>
  import ResizeCircle from "./ResizeCircle.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";

  let {shape} = $props();

  const getCursor = (key) => {
    switch (key) {
      case "top":
      case "bottom" :
        return "ns"
      case "right":
      case "left" :
        return "ew"
      case "topLeft" :
      case "bottomRight":
        return "nwse"
      case "topRight" :
      case "bottomLeft" :
        return "nesw"
    }
  }

  let cornerResizes = $derived(Object.entries(shape.rect).map(([key, corner]) => {
    let sizeBefore = {}
    let resize = new DraggableObject(
      () => {
        shape.isEditing = true;
        shape.beforeProperties.forEach(prop => {
          sizeBefore[prop] = shape[prop];
        });
      },
      (dx, dy) => {
        corner.changeSizeFnc(dx, dy, sizeBefore);
      },
      () => {
        shape.isEditing = false;
      })
    return {setDrag: resize.setDrag, cursor: getCursor(key) + "-resize", ...corner}
  }));
</script>

{#if shape.selected}
  {#each cornerResizes as cornerResize}
    <ResizeCircle x={cornerResize.x} y={cornerResize.y} cursor={cornerResize.cursor}
                  setDrag={cornerResize.setDrag}/>
  {/each}
{/if}