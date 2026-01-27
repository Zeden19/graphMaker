<script>
  import {currentUser} from "$lib/stores/auth.js";
  import {onMount} from "svelte";
  import {goto} from "$app/navigation";
  import Dialog from "$lib/components/Dialog.svelte";

  let activeSection = $state("graphs");
  let activeTab = $state("profile");
  let showDeleteDialog = $state(false);

  const setSection = (section) => {
    activeSection = section;
  };

  const setTab = (tab) => {
    activeTab = tab;
  };

  onMount(() => {
    if (!$currentUser) goto("/")
  });
</script>

{#if $currentUser}
  <div class="account-page">
    <header class="account-header">
      <div class="header-title">
        <h1>Account</h1>
        <p>Manage your graphs and account preferences.</p>
      </div>
      <div class="header-user">
        <div class="user-avatar">GM</div>
        <div class="user-meta">
          <div class="user-label">Signed in as</div>
          <div class="user-email">{$currentUser?.email ?? "guest@graphmaker.app"}</div>
        </div>
      </div>
    </header>

    <div class="account-body">
      <aside class="account-sidebar">
        <button
          class:active={activeSection === "graphs"}
          onclick={() => setSection("graphs")}
        >
          Graphs
        </button>
        <button
          class:active={activeSection === "settings"}
          onclick={() => setSection("settings")}
        >
          Account settings
        </button>
      </aside>

      <section class="account-content">
        {#if activeSection === "graphs"}
          <div class="content-card">
            <div class="card-header">
              <h2>Your graphs</h2>
              <span class="card-subtitle">Recently created and shared graphs.</span>
            </div>
            <div class="graph-list">
              <div class="graph-row">
                <div class="graph-name">Graph concept map</div>
                <div class="graph-meta">Updated 2 hours ago</div>
              </div>
              <div class="graph-row">
                <div class="graph-name">System architecture</div>
                <div class="graph-meta">Updated yesterday</div>
              </div>
              <div class="graph-row">
                <div class="graph-name">Sprint planning</div>
                <div class="graph-meta">Updated last week</div>
              </div>
            </div>
          </div>
        {:else}
          <div class="content-card">
            <div class="card-header">
              <h2>Account settings</h2>
              <span class="card-subtitle">Profile, security, and more.</span>
            </div>
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
                <div class="setting-row">
                  <div>
                    <div class="setting-label">Password</div>
                    <div class="setting-value">••••••••</div>
                  </div>
                  <button class="ghost-button" type="button">Reveal</button>
                </div>
              </div>
            {:else if activeTab === "security"}
              <div class="settings-panel">
                <div class="setting-block">
                  <div class="setting-label">Change password</div>
                  <div class="setting-value">Update your password to keep your account secure.</div>
                  <div class="setting-inputs">
                    <input type="password" placeholder="New password"/>
                    <input type="password" placeholder="Confirm password"/>
                  </div>
                  <button class="primary-button" type="button">Update password</button>
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
          </div>
        {/if}
      </section>
    </div>
  </div>

  <Dialog bind:showDialog={showDeleteDialog}
          confirmText="Confirm Delete"
          title="Delete Account"
          subtitle="This action is permanent. Your account and graphs will be removed and cannot be restored."/>
{/if}

<style>
  .account-page {
    height: calc(100vh - 92px);
    background: var(--secondaryBg);
    color: var(--text);
    padding: 32px 40px 60px;
  }

  .account-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 28px;
  }

  .header-title h1 {
    margin: 0 0 6px;
    font-size: 1.8em;
  }

  .header-title p {
    margin: 0;
    color: rgba(225, 232, 235, 0.6);
  }

  .header-user {
    display: flex;
    gap: 12px;
    align-items: center;
    background: #0f141a;
    border: var(--darkBorder);
    padding: 10px 14px;
    border-radius: 14px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #1f6a3b, #0f2d1c);
    display: grid;
    place-items: center;
    font-weight: 600;
  }

  .user-label {
    font-size: 0.75em;
    color: rgba(225, 232, 235, 0.6);
  }

  .user-email {
    font-size: 0.95em;
    font-weight: 600;
  }

  .account-body {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 28px;
  }

  .account-sidebar {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .account-sidebar button {
    text-align: left;
    padding: 10px 12px;
    border-radius: 10px;
    border: var(--darkBorder);
    color: white;
    background: #0f141a;
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  .account-sidebar button:hover {
    border-color: rgba(65, 71, 92, 0.9);
    background: rgba(22, 28, 36, 0.9);
  }

  .account-sidebar button.active {
    border-color: rgba(42, 167, 93, 0.6);
    background: rgba(31, 106, 59, 0.2);
  }

  .account-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .content-card {
    background: #0f141a;
    border: var(--darkBorder);
    border-radius: 16px;
    padding: 22px;
  }

  .card-header h2 {
    margin: 0 0 4px;
  }

  .card-subtitle {
    color: rgba(225, 232, 235, 0.6);
    font-size: 0.9em;
  }

  .graph-list {
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .graph-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(65, 71, 92, 0.6);
    background: rgba(14, 18, 22, 0.6);
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  .graph-row:hover {
    border-color: rgba(65, 71, 92, 0.9);
    background: rgba(20, 26, 34, 0.8);
  }

  .graph-name {
    font-weight: 600;
  }

  .graph-meta {
    color: rgba(225, 232, 235, 0.6);
    font-size: 0.85em;
  }

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

  @media (max-width: 900px) {
    .account-page {
      padding: 24px;
    }

    .account-body {
      grid-template-columns: 1fr;
    }

    .account-sidebar {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .account-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
