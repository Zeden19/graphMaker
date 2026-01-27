<script>
  import {onMount} from "svelte";
  import {fade} from "svelte/transition";
  import {account} from "$lib/assets/index.js";
  import {authLoading, currentUser} from "$lib/stores/auth.js";
  import {setToast} from "$lib/stores/toast.js";
  import Dialog from "$lib/components/Dialog.svelte";

  const isLoggedIn = $derived(Boolean($currentUser));

  let showPopup = $state(false);
  let popupArea = $state(null);

  const togglePopup = () => {
    showPopup = !showPopup;
  };

  const handleLogout = async () => {
    try {
      const result = await fetch("/accounts/logout", {method: "POST", credentials: "include"});
      if (result.ok)
        setToast({
          type: "success",
          title: "Successfully logged out.",
          subtitle: "You can log back in at any time."
        });
    } catch {
      setToast({
        type: "error",
        title: "Could not log out",
        subtitle: "Please try again."
      });
    } finally {
      currentUser.set(null);
      authLoading.set(false);
      showPopup = false;
      window.location.href = "/";
    }
  };

  const handleWindowClick = (event) => {
    if (popupArea && !(popupArea.contains(event.target))) {
      showPopup = false;
    }
  };

  onMount(() => {
    document.addEventListener("click", handleWindowClick);

    return () => {
      document.removeEventListener("click", handleWindowClick);
    }
  });

  let showLogOutDialog = $state(false);
</script>

<div class="account-root" bind:this={popupArea}>
  <button class="action-buttons" onclick={togglePopup}
  ><img class="action-images" src={account} alt="Account Settings">
  </button>

  {#if showPopup}
    <div transition:fade={{duration: 100}} class="account-popup">
      <div class="account-caret" aria-hidden="true"></div>
      <div class="account-section">
        <div class="account-title">Account</div>
        <div class="account-divider"></div>
        <div class="account-actions">
          {#if isLoggedIn}
            <a class="account-item" href="/account">View account</a>
            <button class="account-item" type="button" onclick={() => showLogOutDialog = true}>Log out</button>
          {:else}
            <a class="account-item" href="/login">Log in</a>
            <a class="account-item" href="/register">Register</a>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<Dialog title="Are you sure you want to log out?" confirmText="Log Out" bind:showDialog={showLogOutDialog}
        onConfirm={handleLogout}/>

<style>
  .account-root {
    position: relative;
    display: flex;
    align-items: center;
  }

  .account-popup {
    position: absolute;
    top: 48px;
    right: 0;
    z-index: 2;
    min-width: 180px;
    background: var(--secondaryBg);
    border: var(--darkBorder);
    border-radius: 10px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
  }

  .account-caret {
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

  .account-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: white;
  }

  .account-title {
    font-weight: 600;
    font-size: 0.8em;
    color: rgba(255, 255, 255, 0.85);
    padding: 4px 6px;
  }

  .account-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 2px 0;
  }

  .account-actions {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .account-item {
    border: none;
    background: transparent;
    color: white;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    text-align: left;
    font-size: 0.85em;
  }

  .account-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }
</style>
