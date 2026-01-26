<script>
  import {onDestroy, onMount} from "svelte";
  import {fly} from "svelte/transition";
  import {backOut} from "svelte/easing";
  import {toast} from "$lib/stores/toast.js";

  let {
    type = "success",
    title = "Success",
    subtitle = "",
    duration = 3000,
    onDismiss = () => {
    }
  } = $props();

  let toastRef = $state();
  let timeRef = $state();

  let timeoutId;

  function showToast() {
    timeRef.style.transition = "none";
    timeRef.style.transition = "scaleX(1)"

    timeRef.offsetWidth;

    timeRef.style.transition = `transform ${duration}ms linear`;
    timeRef.style.transform = "scaleX(0)";

    timeoutId = setTimeout(() => {
      onDismiss();
      $toast = null;
    }, duration)
  }

  onMount(() => {
    showToast();
  });
  onDestroy(() => clearTimeout(timeoutId));
</script>

<div
  class="toast toast--{type}"
  transition:fly={{y: 24, duration: 300, easing: backOut}}
  role="status"
  aria-live="polite"
  bind:this={toastRef}
>
  <div class="toast-icon" aria-hidden="true">
    {#if type === "success"}
      <span class="icon-check">✓</span>
    {:else}
      <span class="icon-x">✕</span>
    {/if}
  </div>
  <div class="toast-content">
    <div class="toast-title">{title}</div>
    {#if subtitle}
      <div class="toast-subtitle">{subtitle}</div>
    {/if}
  </div>
  <div class="toast-progress">
    <div bind:this={timeRef} class="toast-progress-bar"></div>
  </div>
</div>

<style>
  .toast {
    position: fixed;
    right: 24px;
    bottom: 24px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
    align-items: center;
    padding: 12px 14px 14px;
    border-radius: 14px;
    border: 1px solid transparent;
    background: rgba(14, 18, 22, 0.95);
    color: white;
    min-width: 260px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(6px);
  }

  .toast--success {
    border-color: rgba(42, 167, 93, 0.6);
    box-shadow: 0 12px 24px rgba(31, 106, 59, 0.25);
  }

  .toast--error {
    border-color: rgba(210, 71, 71, 0.7);
    box-shadow: 0 12px 24px rgba(150, 42, 42, 0.25);
  }

  .toast-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    font-size: 1.1em;
    font-weight: 700;
  }

  .toast--success .toast-icon {
    background: rgba(31, 106, 59, 0.25);
    color: #7be8a2;
  }

  .toast--error .toast-icon {
    background: rgba(150, 42, 42, 0.25);
    color: #ff9b9b;
  }

  .toast-title {
    font-weight: 600;
    font-size: 0.95em;
    margin-bottom: 2px;
  }

  .toast-subtitle {
    font-size: 0.82em;
    color: rgba(225, 232, 235, 0.7);
  }

  .toast-progress {
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 0px;
    height: 2px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    overflow: hidden;

  }

  .toast-progress-bar {
    height: 100%;
    transform: scaleX(1);
    background: rgba(255, 255, 255, 0.85);
    transform-origin: right;
    transition: width 0.1s linear;
  }

  .icon-check,
  .icon-x {
    line-height: 1;
  }
</style>
