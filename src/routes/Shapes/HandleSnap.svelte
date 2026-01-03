<script>
  // unsnapping happens inside arrow.svelte.js, since movement is easier to track inside there
  import {untrack} from "svelte";

  const BOUNDARY = 20;
  let {shapes, arrow} = $props();

  const isInCorner = (arrowPoint, corner) => {
    return arrowPoint.x > corner.x - BOUNDARY && arrowPoint.x < corner.x + BOUNDARY &&
      arrowPoint.y > corner.y - BOUNDARY && arrowPoint.y < corner.y + BOUNDARY
  }

  const isPointSnappedToAnotherArrow = (shape, key) => {
    return shape.toString().toLowerCase() === "arrow" && shape[key + "Snapped"] !== undefined;
  }

  // bug: when a shape that an arrow is snapped to is deleted, the arrow will remain "snapped" to the shape
  // until the user moves the arrow. Does not cause any errors but its clunky
  $effect(() => {
    // dependencies
    arrow.x1;
    arrow.y1;
    arrow.x2;
    arrow.y2;

    untrack(() => {
      Object.values(shapes).flat(4).forEach((shape) => {
        if (arrow === shape) return;

        Object.entries(shape.points).forEach(([key, corner]) => {
          // can't closure corner directory because derived isn't deeply reactive
          const cornerRef = () => shape.points[key];

          if (isPointSnappedToAnotherArrow(shape, key)) return;

          if (cornerRef && isInCorner(arrow.points.start, corner)) {
            arrow.startSnapped = cornerRef;
          } else if (cornerRef && isInCorner(arrow.points.end, corner)) {
            arrow.endSnapped = cornerRef;
          }
        });
      });
    });
  });
</script>