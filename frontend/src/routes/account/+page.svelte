<script>
  import {currentUser} from "$lib/stores/auth.js";
  import {onMount} from "svelte";
  import {goto} from "$app/navigation";
  import Graphs from "./Graphs.svelte";
  import AccountSettings from "./AccountSettings.svelte";

  let activeSection = $state("graphs");

  const setSection = (section) => {
    activeSection = section;
  };

  onMount(() => {
    if (!$currentUser) goto("/");
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
            <Graphs/>
          </div>
        {:else}
          <div class="content-card">
            <div class="card-header">
              <h2>Account settings</h2>
              <span class="card-subtitle">Profile, security, and more.</span>
            </div>
            <AccountSettings/>
          </div>
        {/if}
      </section>
    </div>
  </div>
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
