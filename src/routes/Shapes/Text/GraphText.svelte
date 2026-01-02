<script>
  import ShapeText from "./ShapeText.svelte";

  let {text = $bindable()} = $props();

  // Use axis-aligned top-left for rendering, just like Square
  let renderPosition = $derived(text.getAxisAlignedTopLeft());
</script>

<ShapeText x={renderPosition.x} y={renderPosition.y}
           width={text.width} height={text.height} shape={text}
           transformOrigin={text.center}
           style="outline: {text.strokeWidth}px {text.strokeColor} solid;"
/>