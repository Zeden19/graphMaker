<script>
  import {currentUser} from "$lib/stores/auth.js";
  import {toast} from "$lib/stores/toast.js";
  import Dialog from "$lib/components/Dialog.svelte";
  import {setToast} from "$lib/stores/toast.js";

  let error = $state('');
  let errorTimeout;

  let showDeleteDialog = $state(false);

  let oldPassword = $state();
  let password = $state();
  let confirmPassword = $state();

  let activeTab = $state("profile");

  async function deleteAccount() {
    try {
      const response = await fetch("/accounts/delete", {credentials: "include", method: "DELETE"});
      if (response.ok) {
        setToast({type: "success", title: "Successfully deleted account"});
      } else {
        setToast({type: "error", title: "Could not Delete account", subtitle: "Please log in and try again"});
      }
    } catch {
      setToast({type: "error", title: "Could not Delete account", subtitle: "Please log in and try again"});
    } finally {
      await fetch("/accounts/logout", {credentials: "include", method: "POST"});
      $currentUser = null;
      window.location.href = "/"
    }
  }

  async function changePassword() {
    clearTimeout(errorTimeout);
    error = "";
    if ((!password) || (!confirmPassword) || password !== confirmPassword) {
      error = "Passwords do not match.";
      return;
    }

    let data;
    try {
      const response = await fetch("/accounts/change-password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({password, oldPassword})
      });
      data = await response.json();
      if (response.ok) {
        $toast = ({
          type: "success",
          title: "Successfully changed password",
        });
        oldPassword = password = confirmPassword = "";
      } else if (data.error === "invalid_credentials") {
        error = "Incorrect Old Password";
      } else {
        $toast = {type: "error", title: "Could not change password", subtitle: "Please log in and try again"};
        oldPassword = password = confirmPassword = "";
      }
    } catch (e) {
      $toast = {type: "error", title: "Could not change password", subtitle: "Please log in and try again"};
      oldPassword = password = confirmPassword = "";
    }
  }

  const setTab = (tab) => {
    activeTab = tab;
  };

  $effect(() => {
    if (error !== "") errorTimeout = setTimeout(() => (error = ""), 2000);
  })
</script>

<div class="settings-tabs">
  <button class:active={activeTab === "profile"} onclick={() => setTab("profile")}>
    Profile
  </button>
  <button class:active={activeTab === "security"} onclick={() => setTab("security")}>
    Security
  </button>
  <button class:active={activeTab === "danger"} onclick={() => setTab("danger")}>
    Danger zone
  </button>
</div>

{#if activeTab === "profile"}
  <div class="settings-panel">
    <div class="setting-row">
      <div>
        <div class="setting-label">Email</div>
        <div class="setting-value">{$currentUser?.email ?? "guest@graphmaker.app"}</div>
      </div>
    </div>
  </div>
{:else if activeTab === "security"}
  <div class="settings-panel">
    <div class="setting-block">
      <div class="setting-label">Change password</div>
      <div class="setting-value">Update your password to keep your account secure.</div>
      <div class="setting-inputs">
        <input type="password" bind:value={oldPassword} placeholder="Old password"/>
        <input type="password" bind:value={password} placeholder="New password"/>
        <input type="password" bind:value={confirmPassword} placeholder="Confirm password"/>
      </div>
      <button class="primary-button" type="button" onclick={changePassword}>Update password</button>
    </div>
  </div>
{:else}
  <div class="settings-panel danger">
    <div class="setting-block">
      <div class="setting-label">Delete account</div>
      <div class="setting-value">
        Permanently delete your account and associated graphs. This cannot be undone.
      </div>
      <button class="danger-button" type="button" onclick={() => showDeleteDialog = true}>
        Delete account
      </button>
    </div>
  </div>
{/if}

{#if error}
  <div class="auth-error" role="alert">{error}</div>
{/if}

<Dialog bind:showDialog={showDeleteDialog}
        confirmText="Confirm Delete"
        onConfirm={deleteAccount}
        title="Delete Account"
        subtitle="This action is permanent. Your account and graphs will be removed and cannot be restored."/>

<style>
  .settings-tabs {
    display: flex;
    gap: 10px;
    margin-top: 18px;
  }

  .settings-tabs button {
    border: 1px solid rgba(65, 71, 92, 0.7);
    background: transparent;
    color: white;
    padding: 6px 12px;
    border-radius: 999px;
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  .settings-tabs button:hover {
    border-color: rgba(65, 71, 92, 0.95);
    background: rgba(22, 28, 36, 0.8);
  }

  .settings-tabs button.active {
    background: rgba(31, 106, 59, 0.2);
    border-color: rgba(42, 167, 93, 0.6);
  }

  .settings-panel {
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid rgba(65, 71, 92, 0.6);
    border-radius: 12px;
    padding: 12px 14px;
    background: rgba(14, 18, 22, 0.6);
  }

  .setting-label {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .setting-value {
    color: rgba(225, 232, 235, 0.6);
    font-size: 0.9em;
  }

  .setting-block {
    border: 1px solid rgba(65, 71, 92, 0.6);
    border-radius: 12px;
    padding: 16px;
    background: rgba(14, 18, 22, 0.6);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .setting-inputs {
    display: grid;
    gap: 10px;
  }

  .primary-button {
    align-self: flex-start;
    background: #1f6a3b;
    border: none;
    color: white;
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .primary-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(31, 106, 59, 0.25);
  }

  .danger {
    border-color: rgba(210, 71, 71, 0.5);
    background: rgba(72, 18, 18, 0.3);
  }

  .auth-error {
    margin-top: 20px;
    border: 1px solid rgba(255, 140, 140, 0.5);
    background: rgba(140, 20, 20, 0.25);
    color: #ffd6d6;
    padding: 10px 15px;
    border-radius: 10px;
    font-size: 0.85em;
  }
</style>