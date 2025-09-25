<script>
  // unsnapping happens inside arrow.svelte.js, since movement is easier to track inside there
  import {untrack} from "svelte";

  const BOUNDARY = 20;
  let {shapes} = $props();

  const arrows = shapes.arrows;
  const allShapes = $derived(Object.values(shapes).flat(4));

  const isInCorner = (arrowPoint, corner) => {
    return arrowPoint.x > corner.x - BOUNDARY && arrowPoint.x < corner.x + BOUNDARY &&
      arrowPoint.y > corner.y - BOUNDARY && arrowPoint.y < corner.y + BOUNDARY
  }

  const preventArrowSnapLoop = (arrow, shape) => {
    if (shape.toString().toLowerCase() === "arrow") {
      return arrows.findIndex((a) => arrow === a) > arrows.findIndex((a) => shape === a);
    }

    return true;
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
        allShapes.forEach((shape) => {
          if (arrow === shape) return;

          Object.entries(shape.rect).forEach(([key, corner]) => {
            // can't closure corner directory because derived isn't deeply reactive
            const cornerRef = () => shape?.rect?.[key];

            // this really isn't the best solution; the arrow that is being moved should be the one that
            // gets snapped. more importance to creating individual effects
            if (!preventArrowSnapLoop(arrow, shape)) return;

            if (cornerRef && isInCorner(arrow.rect.start, corner)) {
              arrow.startSnapped = cornerRef;
            } else if (cornerRef && isInCorner(arrow.rect.end, corner)) {
              arrow.endSnapped = cornerRef;
            }
          });
        });
      });
    });
  });

</script>