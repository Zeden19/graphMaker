<script>
  import ShapeText from "./ShapeText.svelte";

  let {text = $bindable()} = $props();

  let textStyles = $derived(text?.text);
</script>

<ShapeText x={text.position.x} y={text.position.y}
           width={text.widthWithScale} height={text.heightWithScale}
           selected={text.selected} shape={text} text={textStyles}
           style="overflow: visible"
           containerStyles="outline: {text.strokeWidth}px {text.strokeColor} solid;
           rotate: {text.rotation}deg;"
/>

