<script>
  import ShapeText from "./ShapeText.svelte";

  let {text = $bindable()} = $props();

  let transformOrigin = $derived({
    x: text.position.x + (text.widthWithScale / 2),
    y: text.position.y + (text.heightWithScale / 2)
  });
</script>

<ShapeText x={text.position.x} y={text.position.y}
           width={text.widthWithScale} height={text.heightWithScale} shape={text}
           {transformOrigin} style="outline: {text.strokeWidth}px {text.strokeColor} solid;"
           />

