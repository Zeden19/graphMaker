<script>
  import ShapeText from "./ShapeText.svelte";

  let {text = $bindable()} = $props();

  let textStyles = $derived(text?.text);
</script>

<ShapeText x={text.position.x} y={text.position.y}
           width={text.widthWithScale} height={text.heightWithScale}
           selected={text.selected} shape={text} text={textStyles}
/>

