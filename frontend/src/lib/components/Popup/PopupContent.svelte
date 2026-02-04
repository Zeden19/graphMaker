<script>
  import {fade} from "svelte/transition";
  import {getContext} from "svelte";

  let {children, ...popupProps} = $props();

  const popup = getContext("popup");
</script>

{#if popup.open}
  <div class="popup" transition:fade={{duration: 100}} {...popupProps}>
    <div class="caret"></div>
      {@render children()}
  </div>
{/if}

<style>
  .popup {
    position: absolute;
    top: 48px;
    right: 0;
    z-index: 2;
    min-width: 280px;
    background: var(--secondaryBg);
    border: var(--darkBorder);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
  }

  .caret {
    position: absolute;
    top: -6px;
    right: 18px;
    width: 8px;
    height: 8px;
    background: var(--secondaryBg);
    border-left: var(--darkBorder);
    border-top: var(--darkBorder);
    transform: rotate(45deg);
  }
</style>