<script>
  let {arrow = $bindable(), endpointString} = $props();

  let endpoints = $derived([
    {svg: "", label: "Nothing"},
    {svg: `<path fill="${arrow.color.toHex()}" d="M 0 0 L 10 5 L 0 10 z"/>`, label: "Arrow"},
    {
      svg: `<circle r="${arrow.widthWithScale.marker}" fill="${arrow.color.toHex()}" cx="5" cy="5"></circle>`,
      label: "Circle"
    },
    {
      svg: `<rect x="0.5" y="0.5" width="${arrow.widthWithScale.marker + 5}" height="${arrow.widthWithScale.marker + 5}"
                        fill="${arrow.color.toHex()}"></rect>`,
      label: "Square"
    },
    {
      svg: `<line stroke-width="${arrow.widthWithScale.marker}" stroke="${arrow.color.toHex()}"
                        x1="5" y1="0" x2="5" y2="10"></line>`,
      label: "Line"
    },
  ]);
</script>

<select bind:value={arrow[endpointString]}>
  {#each endpoints as endpoint}
    <option value="{endpoint.svg}">{endpoint.label}</option>
  {/each}
</select>