<script>
  import {onMount} from "svelte";
  import {fade} from "svelte/transition";
  import share from "$lib/assets/share.svg";
  import copy from "$lib/assets/copy.svg";
  import {buildGraphPayload} from "$lib/graphShare.js";
  import {toast} from "$lib/stores/toast.js";
  import {currentUser} from "$lib/stores/auth.js";

  let showPopup = $state(false);
  let popupArea = $state(null);
  let shareLink = $state("");
  let graphName = $state("Untitled graph");
  let accountGraphId = $state(null);
  let copied = $state(false);
  let isLoadingLink = $state(false);
  let isSaving = $state(false);
  let copyTimeout;

  const {shapes, clear, offset, removeShape, getShapeArray, shapeClasses} = $props();
  const loadGraphFromId = async (graphId) => {
    let response;
    let graphData;
    try {
      response = await fetch(`/graphs/${graphId}`);
      if (!response.ok) {
        $toast = {type: "error", title: "Graph failed to load", subtitle: "Please check the url"};
        return {error: true};
      }
      graphData = await response.json();
      if (!Array.isArray(graphData.shapes)) {
        $toast = {type: "error", title: "Graph failed to load", subtitle: "Please check the url"};
        return {error: true};
      }
    } catch (e) {
      $toast = {type: "error", title: "Graph failed to load", subtitle: "Please check the url"};
      return;
    }

    if (!Array.isArray(graphData.shapes)) {
      $toast = {type: "error", title: "Graph failed to load", subtitle: "Please check the url"};
      return {error: true};
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
    graphName = graphData.name ?? graphName;
    accountGraphId = null;
    $toast = {type: "success", title: "Graph Successfully Loaded"};
  };

  const loadAccountGraph = async (graphId) => {
    let response;
    let graphData;
    try {
      response = await fetch(`/accounts/graphs/${graphId}`, {credentials: "include"});
      if (!response.ok) {
        $toast = {type: "error", title: "Graph failed to load", subtitle: "Please check the url"};
        return {error: true};
      }
      graphData = await response.json();
      if (!Array.isArray(graphData.shapes)) {
        $toast = {type: "error", title: "Graph failed to load", subtitle: "Please check the url"};
        return {error: true};
      }
    } catch (e) {
      $toast = {type: "error", title: "Graph failed to load", subtitle: "Please check the url"};
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
    graphName = graphData.name ?? graphName;
    accountGraphId = graphId;
    $toast = {type: "success", title: "Graph Successfully Loaded"};
  };

  const getShareLink = async () => {
    const payload = buildGraphPayload(shapes, graphName);
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

  const handleSave = async () => {
    if (!$currentUser) {
      $toast = {type: "error", title: "Sign in required", subtitle: "Log in to save your graph."};
      return;
    }
    isSaving = true;
    try {
      const payload = buildGraphPayload(shapes, graphName);
      const endpoint = accountGraphId ? `/accounts/graphs/${accountGraphId}` : "/accounts/graphs";
      const method = accountGraphId ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({name: graphName, graph: payload})
      });
      if (!response.ok) {
        $toast = {type: "error", title: "Save failed", subtitle: "Unable to save this graph."};
        return;
      }
      if (!accountGraphId) {
        const data = await response.json().catch(() => ({}));
        accountGraphId = data?.id ?? accountGraphId;
      }
      $toast = {type: "success", title: "Graph saved", subtitle: "Find it in your account."};
    } catch {
      $toast = {type: "error", title: "Save failed", subtitle: "Network error saving graph."};
    } finally {
      isSaving = false;
    }
  };

  const handleCopy = async () => {
    const text = shareLink ?? "";
    await navigator.clipboard.writeText(text);
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
    const ownedGraphId = params.get("og");
    if (graphId) {
      loadGraphFromId(graphId);
    }
    if (ownedGraphId) {
      loadAccountGraph(ownedGraphId);
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
      <div class="share-divider"></div>
      <div class="share-section">
        <div class="share-title">Save to account</div>
        {#if $currentUser}
          <div class="share-input-row">
            <input class="share-input" type="text" bind:value={graphName} aria-label="Graph name"/>
            <button class="share-save" type="button" onclick={handleSave} disabled={isSaving}>
              {#if isSaving}
                <span class="spinner" aria-hidden="true"></span>
              {/if}
              <span>{isSaving ? "Saving" : "Save"}</span>
            </button>
          </div>
        {:else}
          <div class="share-empty">Log in to save graphs to your account.</div>
        {/if}
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

  .share-copy:hover {
    background: rgba(255, 255, 255, 0.1);
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

  .share-save {
    border: var(--darkBorder);
    background: #1f6a3b;
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .share-save:disabled {
    opacity: 0.7;
    cursor: default;
  }

  .share-empty {
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px dashed rgba(65, 71, 92, 0.6);
    color: rgba(225, 232, 235, 0.6);
    font-size: 0.85em;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #ffffff;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .share-copy-text {
    font-size: 0.85em;
    line-height: 1;
  }
</style>
