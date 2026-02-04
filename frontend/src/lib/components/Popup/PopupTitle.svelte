<script>
  let {children} = $props();
</script>

<div class="popup-title">
  {@render children()}
</div>

<style>
  .popup-title {
    font-weight: 600;
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.85);
  }
</style>