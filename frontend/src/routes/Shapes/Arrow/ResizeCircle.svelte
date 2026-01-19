<script>
  import {fade} from "svelte/transition";
  let {x, y, setDrag, moving} = $props();
</script>

<circle cx={x} cy={y} r={8}
        transition:fade={{duration: 120}}
        style="transform-origin: {x}px {y}px;"
        onmousedown="{(event) => {setDrag(event); moving()}}"
        fill="white"
        stroke="black"
        stroke-width="2"
        role="presentation"
        cursor="move"
/>
