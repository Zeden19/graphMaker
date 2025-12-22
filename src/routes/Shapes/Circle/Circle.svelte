<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";

  let {circle = $bindable()} = $props();

</script>

<ellipse
  transition:scale|global={{duration: 120}}
  rx="{circle.width}"
  ry="{circle.height}"
  cx="{circle.position.x}"
  cy="{circle.position.y}"
  fill="{circle.color}"
  stroke={circle.strokeColor}
  stroke-width="{circle.strokeWidth}"
  style="transform-origin: {circle.position.x}px {circle.position.y}px;
         rotate: {circle.rotation}deg"
  role="presentation"
/>

<!--the math might be completely fucked and way outta my league to figure out the rotation-->
<!--I will do it, it just might take a while-->
<ShapeText shape={circle}
           transformOrigin={{x: circle.position.x, y: circle.position.y}}
           x={circle.rect.topLeft.x} y={circle.rect.topLeft.y}
           width={Math.abs(circle.rect.topRight.x - circle.rect.topLeft.x)}
           height={Math.abs(circle.rect.bottomLeft.y - circle.rect.topLeft.y)}/>

<style>
  ellipse {
    cursor: grab;
    transition: fill var(--shape-transition-timing), stroke var(--shape-transition-timing);
  }
</style>