<script>
  import {arrowEndpointLabels} from "$lib/arrowEndpoints.js";
  let {endpoint = $bindable()} = $props();

  let color = $state();
  let width = $state();
</script>

<select bind:value={endpoint}>
  {#each arrowEndpointLabels as endpoint}
    <option value="{endpoint}">{endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}</option>
  {/each}
</select>

<style>
  select {
    border-radius: 8px;
    background: var(--secondaryBg);
    border: var(--darkBorder);
    padding: 7px 10px;
    color: white;
    width: 8em;
  }
</style>