<script>
  import {scale} from "svelte/transition";
  import ShapeText from "../Text/ShapeText.svelte";

  let {text} = $props();

  // Use the axis-aligned top-left for rendering
  let renderPosition = $derived(text.getAxisAlignedTopLeft());
  let strokeInset = $derived(text.strokeWidth / 2);
</script>

<rect
  transition:scale|global={{duration: 120}}
  style="transform-origin: {text.center.x}px {text.center.y}px;
         rotate: {text.rotation}deg;"
  stroke="{text.strokeColor}"
  stroke-dasharray="{text.strokeStyle}"
  stroke-width="{text.strokeWidth}"
  x="{renderPosition.x - strokeInset}"
  y="{renderPosition.y - strokeInset}"
  width="{text.width + text.strokeWidth}"
  height="{text.height + text.strokeWidth}"
  fill="none"
  bind:this={text.ref}
></rect>

<ShapeText shape={text} x={renderPosition.x} y={renderPosition.y}
           transformOrigin={text.center}
           width={text.width} height={text.height}></ShapeText>
