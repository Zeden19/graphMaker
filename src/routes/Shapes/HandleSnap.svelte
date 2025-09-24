<script>
  // unsnapping happens inside arrow.svelte.js, since movement is easier to track inside there
  import {untrack} from "svelte";

  const BOUNDARY = 20;
  let {shapes, offset} = $props();

  const arrows = shapes.arrows;
  const allShapes = $derived(Object.values(shapes).flat(4));

  const isInCorner = (arrowPoint, corner) => {
    return arrowPoint.x > corner.x - BOUNDARY && arrowPoint.x < corner.x + BOUNDARY &&
      arrowPoint.y > corner.y - BOUNDARY && arrowPoint.y < corner.y + BOUNDARY
  }

  // create individual effects for each arrow,
  // (track them in a array so we don't duplicate effects when adding/removing arrow)
  // makes it slightly more faster
  $effect(() => {
    // dependencies
    arrows.forEach(arrow => {
      arrow.x1;
      arrow.y1;
      arrow.x2;
      arrow.y2;
    });


    untrack(() => {
      arrows.forEach(arrow => {
        allShapes.forEach((shape, allShapesIndex) => {
          if (arrow === shape) return;

          Object.entries(shape.rect).forEach(([key, corner]) => {
            if (isInCorner(arrow.rect.start, corner)) {
              arrow.startSnapped = () => allShapes[allShapesIndex].rect[key];
            } else if (isInCorner(arrow.rect.end, corner)) {
              arrow.endSnapped = () => allShapes[allShapesIndex].rect[key];
            }
          });
        });
      });
    });
  });

</script>