<script>
  import {fade} from "svelte/transition";
  let {x, y, setDrag, cursor} = $props();
</script>

<circle cx={x} cy={y} r={8}
        transition:fade={{duration: 120}}
        style="transform-origin: {x}px {y}px;"
        onmousedown="{setDrag}"
        fill="white"
        stroke="black"
        stroke-width="2"
        role="presentation"
        cursor={cursor}
/>
