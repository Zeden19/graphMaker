<script>
  let {shapes, endpoint = $bindable(), endpointString} = $props();

  let color = $state();
  let width = $state();

  let endpoints = [
    "nothing",
    "arrow",
    "circle",
    "square",
    "line"]
</script>

<select bind:value={endpoint}>
  {#each endpoints as endpoint}
    <option value="{endpoint}">{endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}</option>
  {/each}
</select>