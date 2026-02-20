<script>
  import {account} from "$lib/assets/index.js";
  import {apiUrl} from "$lib/api.js";
  import {authLoading, currentUser, resolvedUser} from "$lib/stores/auth.js";
  import {setToast} from "$lib/stores/toast.js";
  import Popup from "$lib/components/Popup/Popup.svelte";
  import PopupTrigger from "$lib/components/Popup/PopupTrigger.svelte";
  import PopupContent from "$lib/components/Popup/PopupContent.svelte";
  import PopupTitle from "$lib/components/Popup/PopupTitle.svelte";
  import PopupDivider from "$lib/components/Popup/PopupDivider.svelte";
  import DialogTrigger from "$lib/components/Dialog/DialogTrigger.svelte";
  import Dialog from "$lib/components/Dialog/Dialog.svelte";
  import DialogContent from "$lib/components/Dialog/DialogContent.svelte";

  const isLoggedIn = $derived(!!$resolvedUser);

  const handleLogout = async () => {
    try {
      const result = await fetch(apiUrl("/accounts/logout"), {method: "POST", credentials: "include"});
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
      window.location.href = "/";
    }
  };

  let showLogOutDialog = $state(false);
</script>

<Popup>
  <PopupTrigger>
    <img class="action-images" src={account} alt="Account Settings">
  </PopupTrigger>
  <PopupContent style="min-width: 180px">
    <div class="account-section">
      <PopupTitle>Account</PopupTitle>
      <PopupDivider/>
      <div class="account-actions">
        {#if $authLoading}
          <span class="account-item account-item--disabled">Checking account...</span>
        {:else if isLoggedIn}
          <a class="account-item" href="/account">View account</a>
          <Dialog>
            <DialogTrigger class="account-item">
              Log out
            </DialogTrigger>

            <DialogContent title="Are you sure you want to log out?" confirmText="Log Out"
                           bind:showDialog={showLogOutDialog}
                           onConfirm={handleLogout}/>
          </Dialog>
        {:else}
          <a class="account-item" href="/login">Log in</a>
          <a class="account-item" href="/register">Register</a>
        {/if}
      </div>
    </div>
  </PopupContent>
</Popup>

<style>
  .account-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: white;
  }

  .account-actions {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .account-item, :global(.account-item) {
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

  .account-item:hover, :global(.account-item:hover) {
    background: rgba(255, 255, 255, 0.08);
  }

  .account-item--disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>
