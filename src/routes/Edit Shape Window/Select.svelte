<script>
  import {onDestroy, onMount} from "svelte";
  import {fade} from "svelte/transition";

  let {value = $bindable(), options = [], size = "md"} = $props();

  let isOpen = $state(false);
  let rootRef = $state();

  const normalizedOptions = $derived(options.map((option) => {
    if (typeof option === "string") {
      return {label: option, value: option};
    }
    return option;
  }));

  const selectedOption = $derived(
    normalizedOptions.find((option) => option.value === value) ?? normalizedOptions[0]
  );
  const selectedIndex = $derived(
    Math.max(0, normalizedOptions.findIndex((option) => option.value === value))
  );

  const menuOffset = $derived.by(() => {
    const optionHeight = 16;
    const menuPadding = 6;
    return -(menuPadding + (selectedIndex * optionHeight));
  });

  const toggleOpen = () => {
    isOpen = !isOpen;
  };

  const close = () => {
    isOpen = false;
  };

  const handleFocusOut = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      close();
    }
  };

  const hasDash = (option) => option?.dash && option.dash !== "0";

  const previewDash = (option) => {
    if (!hasDash(option)) return undefined;
    const parts = String(option.dash)
      .split(/[,\s]+/)
      .map((value) => Number.parseFloat(value))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (parts.length === 0) return undefined;
    const minPart = Math.min(...parts);
    const targetMin = 2.5;
    const scale = Math.min(4, Math.max(1, targetMin / minPart));
    return parts.map((value) => (value * scale).toFixed(2)).join(" ");
  };

  const handleOutsideClick = (event) => {
    if (!rootRef) return;
    if (!rootRef.contains(event.target)) {
      close();
    }
  };

  onMount(() => {
    document.addEventListener("mousedown", handleOutsideClick);
  });

  onDestroy(() => {
    document.removeEventListener("mousedown", handleOutsideClick);
  });
</script>

<div class="select {size}" onblur={handleFocusOut} bind:this={rootRef}>
  <button
    class="select-trigger"
    type="button"
    aria-expanded={isOpen}
    onclick={toggleOpen}
  >
    {#if selectedOption?.dash !== undefined}
      <svg class="dash-preview" viewBox="0 0 50 10" aria-hidden="true">
        <line
          x1="0"
          y1="5"
          x2="50"
          y2="5"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray={previewDash(selectedOption)}
        />
      </svg>
      <span class="sr-only">{selectedOption?.label ?? "Option"}</span>
    {:else}
      {selectedOption?.label ?? "Select"}
    {/if}
    <span class="chevron" aria-hidden="true">▾</span>
  </button>

  {#if isOpen}
    <div class="select-menu" role="listbox" style="transform: translateY({menuOffset}px);"
         transition:fade={{duration: 100}}>
      {#each normalizedOptions as option}
        <button
          type="button"
          class="select-option"
          role="option"
          aria-selected={option.value === value}
          onclick={() => { value = option.value; close(); }}
        >
          {#if option.dash !== undefined}
            <svg class="dash-preview" viewBox="0 0 50 10" aria-hidden="true">
              <line
                x1="0"
                y1="5"
                x2="50"
                y2="5"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-dasharray={previewDash(option)}
              />
            </svg>
            <span class="sr-only">{option.label}</span>
          {:else}
            {option.label}
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .select {
    position: relative;
    display: inline-block;
    min-width: 7.5em;
  }

  .select.sm {
    min-width: 4em;
  }

  .select-trigger {
    width: 100%;
    border-radius: 8px;
    background: var(--secondaryBg);
    border: var(--darkBorder);
    padding: 6px 26px 6px 10px;
    min-height: 32px;
    line-height: 1.2;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
    cursor: pointer;
  }

  .dash-preview {
    width: 100%;
    height: 12px;
    display: block;
  }

  .chevron {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .select-menu {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    background: var(--secondaryBg);
    border: var(--darkBorder);
    border-radius: 10px;
    padding: 6px;
    display: grid;
    gap: 4px;
  }

  .select-option {
    border: none;
    background: transparent;
    padding: 6px 8px;
    border-radius: 6px;
    min-height: 16px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .select-option[aria-selected="true"] {
    background: rgba(255, 255, 255, 0.08);
  }

  .select-option:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
</style>
