<script>
  import {onMount} from "svelte";

  let {shape, index = undefined} = $props();
  shape.arrowsSnappedIndexes = [];

  onMount(() => {
    const areaSize = 20;

    const onArrowMove = ({detail: {x, y, index: arrowIndex, pos}}) => {
      if (index === arrowIndex) return;
      Object.entries(shape.rect).forEach(([location, point]) => {
        if ((x < point.x + areaSize && x > point.x - areaSize) &&
          (y < point.y + areaSize && y > point.y - areaSize)) {

          if (!shape.arrowsSnappedIndexes.map(arrow => arrow.index).includes(arrowIndex)) {
            shape.arrowsSnappedIndexes.push({index: arrowIndex, pos});
          }
          const shapeRef = () => shape.rect[location];
          dispatchEvent(new CustomEvent(`arrowSnap${arrowIndex}`, {detail: {pos, edgeRef: shapeRef}}));
        }
      });
    }

    window.addEventListener("arrowMove", onArrowMove);
    return () => {
      window.removeEventListener("arrowMove", onArrowMove);
    }
  });
</script>