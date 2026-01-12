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
    const shapeName = shape.toString().toLowerCase();
    return (shapeName.includes("arrow")) && shape[key + "Snapped"] !== undefined;
  }

  $effect(() => {
    // dependencies
    arrow.x1;
    arrow.y1;
    arrow.x2;
    arrow.y2;

    untrack(() => {
      Object.values(shapes).flat(4).forEach((shape) => {
        if (arrow === shape) return;
        if (shape.isDeleting) return;

        Object.entries(shape.points).forEach(([key, corner]) => {
          // can't closure corner directory because derived isn't deeply reactive
          const cornerRef = () => shape.points[key];

          if (isPointSnappedToAnotherArrow(shape, key)) return;

          if (cornerRef && isInCorner(arrow.points.start, corner)) {
            arrow.startSnapped = cornerRef;
            arrow.startSnappedShape = () => shape;
          } else if (cornerRef && isInCorner(arrow.points.end, corner)) {
            arrow.endSnapped = cornerRef;
            arrow.endSnappedShape = () => shape;

          }
        });
      });
    });
  });
</script>
