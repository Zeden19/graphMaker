<script>
  import {onMount} from "svelte";

  let {shape, index = undefined} = $props();
  shape.arrowsSnappedIndexes = [];
  const AREA_SIZE = 40;

  onMount(() => {
      const areaSize = 20;

      const onArrowMove = ({detail: {x, y, index: arrowIndex, pos}}) => {
        // making sure arrow can't snap to itself
        if (index === arrowIndex) return;

        const arrowSnapped = shape.arrowsSnappedIndexes.find(({index, pos: arrowPos, ref}) =>
          index === arrowIndex && arrowPos === pos);

        // unsnap an arrow
        if (arrowSnapped && (!(x < arrowSnapped.ref().x + AREA_SIZE && x > arrowSnapped.ref().x - AREA_SIZE) ||
          !(y < arrowSnapped.ref().y + AREA_SIZE && y > arrowSnapped.ref().y - AREA_SIZE))) {
          shape.arrowsSnappedIndexes.splice(
            shape.arrowsSnappedIndexes.findIndex(arrow => arrow.index === arrowIndex && arrow.pos === pos), 1);

          // check to snap an arrow
        } else {
          Object.entries(shape.rect).forEach(([location, point]) => {
            if ((x < point.x + areaSize && x > point.x - areaSize) &&
              (y < point.y + areaSize && y > point.y - areaSize)) {

              const shapeRef = () => shape.rect[location];
              dispatchEvent(new CustomEvent(`moveArrow${arrowIndex}`, {detail: {pos, ref: shapeRef}}));
              if (!shape.arrowsSnappedIndexes.map(arrow => arrow.index).includes(arrowIndex)) {
                shape.arrowsSnappedIndexes.push({index: arrowIndex, pos, ref: shapeRef});
                console.log("arrow", arrowIndex, "snapped to", index)
              }
            }
          })
        }
      }

      const onCompletelyUnsnapArrow = ({detail: {index: arrowIndex}}) => {
        const arrowsToUnsnap = shape.arrowsSnappedIndexes.filter((arrow) => arrow.index !== arrowIndex);
        arrowsToUnsnap.forEach(({index: indexToUnsnap}) => {
          shape.arrowsSnappedIndexes.splice(indexToUnsnap, 1);
        });

      }

      window.addEventListener("arrowMove", onArrowMove);
      window.addEventListener("completelyUnsnapArrow", onCompletelyUnsnapArrow);
      return () => {
        window.removeEventListener("arrowMove", onArrowMove);
        window.removeEventListener("completelyUnsnapArrow", onCompletelyUnsnapArrow);
      }
    }
  );

  $effect(() => {
    shape.x;
    shape.x1;
    shape.arrowsSnappedIndexes.forEach(({index, pos, ref}) => {
      dispatchEvent(new CustomEvent(`moveArrow${index}`, {detail: {pos, ref}}))
    });
  });
</script>