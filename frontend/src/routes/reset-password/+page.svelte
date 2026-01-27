<script>
  import {page} from "$app/state";
  import {setToast} from "$lib/stores/toast.js";

  let password = $state("");
  let confirmPassword = $state("");
  let error = $state("");
  let isSubmitting = $state(false);
  let errorTimeout;

  const token = $derived(page.url.searchParams.get("token") ?? "");

  const handleSubmit = async (event) => {
    event.preventDefault();
    error = "";
    clearTimeout(errorTimeout);

    if (!token) {
      error = "Reset link is missing or invalid.";
      return;
    }
    if (!password) {
      error = "Enter a new password.";
      return;
    }
    if (password !== confirmPassword) {
      error = "Passwords do not match.";
      return;
    }

    isSubmitting = true;
    try {
      const response = await fetch("/accounts/reset-password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({token, password})
      });
      if (!response.ok) {
        error = "Unable to reset password.";
        return;
      }
      setToast({type: "success", title: "Successfully reset password", subtitle: "Log in with your new password."})
      window.location.href = "/login";
    } catch {
      error = "Unable to reset password.";
    } finally {
      isSubmitting = false;
    }
  };

  $effect(() => {
    if (error !== "") errorTimeout = setTimeout(() => (error = ""), 2000);
  })
</script>

<div class="auth-page">
  <div class="auth-card">
    <div class="auth-header">
      <h1>Set a new password</h1>
      <p>Choose a strong password to secure your account.</p>
    </div>

    <form class="auth-form" onsubmit={handleSubmit}>
      <label class="field">
        <span class="field-label">New password</span>
        <input type="password" placeholder="••••••••" autocomplete="new-password" bind:value={password}/>
      </label>

      <label class="field">
        <span class="field-label">Confirm password</span>
        <input type="password" placeholder="••••••••" autocomplete="new-password" bind:value={confirmPassword}/>
      </label>

      {#if error}
        <div class="auth-error" role="alert">{error}</div>
      {/if}

      <button class="auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update password"}
      </button>
    </form>
  </div>
</div>

<style>
  .auth-page {
    min-height: 100vh;
    display: grid;
    align-content: start;
    place-items: center;
    background: var(--secondaryBg);
  }

  .auth-card {
    margin-top: 8em;
    width: min(420px, 100%);
    background: linear-gradient(160deg, rgba(18, 22, 28, 0.95), rgba(9, 12, 16, 0.95));
    border: var(--darkBorder);
    border-radius: 18px;
    padding: 28px 26px 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  }

  .auth-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 24px;
  }

  .auth-header h1 {
    font-size: 1.6em;
    margin: 0;
    letter-spacing: 0.02em;
  }

  .auth-header p {
    margin: 0;
    color: rgba(225, 232, 235, 0.7);
    font-size: 0.92em;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .field {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 12px 10px;
    border: 2px solid #41475c;
    border-radius: 12px;
    background: #0f141a;
  }

  .field-label {
    position: absolute;
    top: -9px;
    left: 12px;
    padding: 0 6px;
    font-size: 0.68em;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: #0f141a;
    color: rgba(225, 232, 235, 0.7);
  }

  .field input {
    border: none;
    background: transparent;
    padding: 0 2px;
    outline: none;
    color: white;
  }

  .auth-submit {
    background: #1f6a3b;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 10px 16px;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .auth-submit:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(31, 106, 59, 0.35);
  }

  .auth-submit:disabled {
    cursor: default;
    opacity: 0.7;
    transform: none;
    box-shadow: none;
  }

  .auth-error {
    display: inline-block;
    border: 1px solid rgba(255, 140, 140, 0.5);
    background: rgba(140, 20, 20, 0.25);
    color: #ffd6d6;
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 0.85em;
  }
</style>
