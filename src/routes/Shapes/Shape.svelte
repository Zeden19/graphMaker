<script>
  import {onDestroy, onMount} from "svelte";

  let {
    shape = $bindable(),
    children,
    editShapeContainerRef,
    highlightSelection,
    highlightDimensions,
    selectedShapes
  } = $props();

  let gRef = $state();
  shape.gRef = () => gRef;

  const deselect = (event) => {
    // dont' deselect if clicking shape, the edit, holding shift (to multi-select),
    // or if clicking on another shape (keeping multiselect after moving)
    if (shape && gRef && !(gRef.contains(event.target)) && !(editShapeContainerRef.contains(event.target)) &&
      !event.shiftKey && !selectedShapes.some(shape => shape.gRef().contains(event.target))) {
      shape.selected = false;
    }
  };

  // potentially wasting resources with event listeners; we can just delete all the selected ones; also useful for deleting with button
  const deleteWithKey = (event) => {
    if ((shape && !shape.selected) || event.key.toLowerCase() !== "backspace" || shape.isEditing) return;
    shape.delete();
  }

  const moveShapes = (event) => {
    // needed to unselect a shape already selected to prevent the previously selected shape from also moving
    const isAlreadySelected = selectedShapes.some((selectedShape) => selectedShape === shape);
    if (!isAlreadySelected && !event.shiftKey) {
      selectedShapes.forEach((shape) => shape.selected = false)
    }

    shape.selected = true; // need this to actually select a individual shape
    selectedShapes.forEach(shape => {
      if (!shape.isEditing)
        shape.setDrag(event);
    });
  }

  onMount(async () => {
    window.addEventListener("mousedown", deselect);
    window.addEventListener("keydown", deleteWithKey)
  });

  onDestroy(() => {
    window.removeEventListener("mousedown", deselect);
    window.removeEventListener("keydown", deleteWithKey)
  });

  $effect(() => {
    if (highlightSelection &&
      shape.isInside(highlightDimensions.x1, highlightDimensions.y1, highlightDimensions.x2, highlightDimensions.y2)
    ) {
      shape.selected = true;
    }
  });

</script>

<g bind:this={gRef} onmousedown={moveShapes} role="presentation">
  {@render children()}
</g>

<style></style>