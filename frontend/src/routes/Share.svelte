<script>
  import {onMount} from "svelte";
  import {fade} from "svelte/transition";
  import share from "$lib/assets/share.svg";
  import copy from "$lib/assets/copy.svg";
  import {buildGraphPayload} from "$lib/graphShare.js";

  const {shapes, clear, offset, removeShape, getShapeArray, shapeClasses} = $props();
  const loadGraphFromId = async (graphId) => {
    const response = await fetch(`/graphs/${graphId}`);
    if (!response.ok) {
      console.error("Failed to load graph", response.status);
      return;
    }
    const graphData = await response.json();
    if (!Array.isArray(graphData.shapes)) {
      console.error("Invalid graph payload");
      return;
    }
    clear();
    graphData.shapes.forEach((shapeData) => {
      const shapeType = shapeData?.toString;
      const ShapeClassRef = shapeClasses[shapeType];
      if (!ShapeClassRef) return;
      const shapeInstance = new ShapeClassRef(offset, shapeData, removeShape);
      const shapeArray = getShapeArray(ShapeClassRef.name);
      shapeArray?.push(shapeInstance);
    });
  };

  const getShareLink = async () => {
    const payload = buildGraphPayload(shapes);
    const response = await fetch("/graphs", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Failed to create share link (${response.status})`);
    }
    const {id} = await response.json();
    const url = new URL(window.location.href);
    url.searchParams.set("g", id);
    return url.toString();
  };

  let showPopup = $state(false);
  let popupArea = $state(null);
  let shareLink = $state("");
  let copied = $state(false);
  let isLoadingLink = $state(false);
  let copyTimeout;

  const loadShareLink = async () => {
    if (typeof getShareLink !== "function") return;
    isLoadingLink = true;
    try {
      shareLink = await getShareLink();
    } catch (error) {
      console.error("Failed to create share link", error);
    } finally {
      isLoadingLink = false;
    }
  };

  const togglePopup = () => {
    showPopup = !showPopup;
    if (showPopup) {
      loadShareLink();
    }
  };

  const handleCopy = async () => {
    const text = shareLink ?? "";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    copied = true;
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copied = false;
    }, 1200);
  };

  const handleWindowClick = (event) => {
    if (popupArea && !(popupArea.contains(event.target))) {
      showPopup = false;
    }
  };

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const graphId = params.get("g");
    if (graphId) {
      loadGraphFromId(graphId);
    }

    document.addEventListener("click", handleWindowClick);

    return () => {
      document.removeEventListener("click", handleWindowClick);
      clearTimeout(copyTimeout);
    }
  });
</script>

<div class="share-root" bind:this={popupArea}>
  <button class="action-buttons" onclick={togglePopup} aria-label="Share">
    <img class="action-images" src={share} alt="Share"></button>
  {#if showPopup}
    <div transition:fade={{duration: 100}} class="share-popup">
      <div class="share-section">
        <div class="share-title">Account</div>
        <div class="share-placeholder">Placeholder account details</div>
        <button class="share-login">Login to save.</button>
      </div>
      <div class="share-divider"></div>
      <div class="share-section">
        <div class="share-title">Share link</div>
        <div class="share-input-row">
          <input class="share-input" type="text" bind:value={shareLink} aria-label="Share link"
                 placeholder={isLoadingLink ? "Generating link..." : ""}/>
          <button class="share-copy" class:share-copy--success={copied} onclick={handleCopy} aria-live="polite">
            <img class="share-copy-icon" src={copy} alt="Copy Graph link" aria-hidden="true"/>
            <span class="share-copy-text">{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .share-root {
    position: relative;
    display: flex;
    align-items: center;
  }

  .share-popup {
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
    gap: 12px;
  }

  .share-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: white;
  }

  .share-title {
    font-weight: 600;
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.85);
  }

  .share-placeholder {
    font-size: 0.85em;
    color: rgba(255, 255, 255, 0.6);
  }

  .share-login {
    border: var(--darkBorder);
    background: #11161c;
    color: white;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
  }

  .share-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  .share-input-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .share-input {
    width: 100%;
    min-width: 0;
    flex: 1;
    padding: 6px 8px;
    border: var(--darkBorder);
    background: #0f141a;
    color: white;
    border-radius: 8px;
  }

  .share-copy {
    border: var(--darkBorder);
    background: #11161c;
    color: white;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 88px;
    justify-content: center;
  }

  .share-copy--success {
    background: #30a55c;
    border-color: #30a55c;
  }

  .share-copy-icon {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }

  .share-copy-text {
    font-size: 0.85em;
    line-height: 1;
  }
</style>
