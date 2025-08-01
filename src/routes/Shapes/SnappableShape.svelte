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

          const shapeRef = () => shape.rect[location];
          dispatchEvent(new CustomEvent(`moveArrow${arrowIndex}`, {detail: {pos, ref: shapeRef}}));
          if (!shape.arrowsSnappedIndexes.map(arrow => arrow.index).includes(arrowIndex)) {
            shape.arrowsSnappedIndexes.push({index: arrowIndex, pos, ref: shapeRef});
          }
        }
      });
    }

    const onArrowUnsnap = ({detail: {index, pos}}) => {
      console.log('unsnap', index, pos);
      shape.arrowsSnappedIndexes.splice(
        shape.arrowsSnappedIndexes.findIndex(arrow => arrow.index === index && arrow.pos === pos), 1)
    }

    window.addEventListener("arrowMove", onArrowMove);
    window.addEventListener("arrowUnsnap", onArrowUnsnap);
    return () => {
      window.removeEventListener("arrowMove", onArrowMove);
      window.addEventListener("arrowUnsnap", onArrowUnsnap);
    }
  });

  $effect(() => {
    shape.x;
    shape.x1;
    shape.arrowsSnappedIndexes.forEach(({index, pos, ref}) => {
      dispatchEvent(new CustomEvent(`moveArrow${index}`, {detail: {pos, ref}}))
    })
  });
</script>