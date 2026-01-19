<script>
  // unsnapping happens inside arrow.svelte.js, since movement is easier to track inside there
  import {untrack} from "svelte";

  const BOUNDARY = 10;
  const MIN_BOUNDARY = 3;
  const BOUNDARY_SCALE = 0.25;
  let {shapes, arrow} = $props();

  const getShapeBoundary = (shape) => {
    if (typeof shape?.width === "number" && typeof shape?.height === "number") {
      const minDimension = Math.min(shape.width, shape.height);
      return Math.min(BOUNDARY, Math.max(MIN_BOUNDARY, minDimension * BOUNDARY_SCALE));
    }
    return BOUNDARY;
  }

  const isInCorner = (arrowPoint, corner, boundary) => {
    return arrowPoint.x > corner.x - boundary && arrowPoint.x < corner.x + boundary &&
      arrowPoint.y > corner.y - boundary && arrowPoint.y < corner.y + boundary
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

        const boundary = getShapeBoundary(shape);

        Object.entries(shape.points).forEach(([key, corner]) => {
          // can't closure corner directory because derived isn't deeply reactive
          const cornerRef = () => shape.points[key];

          if (isPointSnappedToAnotherArrow(shape, key)) return;

          const arrowStart = arrow.snapPoints?.start ?? arrow.points.start;
          const arrowEnd = arrow.snapPoints?.end ?? arrow.points.end;

          if (cornerRef && isInCorner(arrowStart, corner, boundary)) {
            arrow.startSnapped = cornerRef;
            arrow.startSnappedShape = () => shape;
          } else if (cornerRef && isInCorner(arrowEnd, corner, boundary)) {
            arrow.endSnapped = cornerRef;
            arrow.endSnappedShape = () => shape;
          }
        });
      });
    });
  });
</script>
