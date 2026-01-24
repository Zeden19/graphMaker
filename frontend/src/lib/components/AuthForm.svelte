<script>
  import {authLoading, currentUser} from "$lib/stores/auth.js";

  let {
    title,
    subtitle = "",
    primaryLabel,
    showConfirmPassword = false,
    showForgotPassword = false,
    forgotHref = "",
    endpoint = "",
    successRedirect = "/",
    secondaryText = "",
    secondaryLinkText = "",
    secondaryHref = ""
  } = $props();

  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let error = $state("");
  let isSubmitting = $state(false);
  let errorTimeout;

  const errorMessages = {
    missing_fields: "Enter an email and password.",
    invalid_credentials: "Email or password is incorrect.",
    email_taken: "That email already has an account.",
    db_error: "Something went wrong. Try again.",
    invalid_json: "Invalid data sent.",
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    error = "";
    clearTimeout(errorTimeout);
    if (!email || !password) {
      error = errorMessages.missing_fields;
      return;
    }
    if (showConfirmPassword && password !== confirmPassword) {
      error = "Passwords do not match.";
      return;
    }
    if (!endpoint) {
      error = "No endpoint configured; Please contact me.";
      return;
    }

    isSubmitting = true;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({email, password})
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        error = errorMessages[payload?.error] ?? "Unable to continue.";
        return;
      }

      const payload = await response.json().catch(() => ({}));
      if (payload?.user) {
        $currentUser = payload.user;
      }
      $authLoading = false;
      window.location.href = successRedirect;
    } catch {
      error = errorMessages.db_error;
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
      <h1>{title}</h1>
      {#if subtitle}
        <p>{subtitle}</p>
      {/if}
    </div>

    <form class="auth-form" onsubmit={handleSubmit}>
      <label class="field">
        <span class="field-label">Email</span>
        <input type="email" placeholder="name@domain.com" autocomplete="email" bind:value={email}/>
      </label>

      <label class="field">
        <span class="field-label">Password</span>
        <input type="password" placeholder="••••••••" autocomplete="current-password" bind:value={password}/>
      </label>

      {#if showForgotPassword}
        <a class="auth-forgot" href={forgotHref}>Forgot password?</a>
      {/if}

      {#if showConfirmPassword}
        <label class="field">
          <span class="field-label">Confirm password</span>
          <input type="password" placeholder="••••••••" autocomplete="new-password" bind:value={confirmPassword}/>
        </label>
      {/if}

      {#if error}
        <div class="auth-error" role="alert">{error}</div>
      {/if}

      <button class="auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Working..." : primaryLabel}
      </button>

      {#if secondaryText}
        <div class="auth-footer">
          <span>{secondaryText}</span>
          <a href={secondaryHref}>{secondaryLinkText}</a>
        </div>
      {/if}
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
    border: 1px solid rgba(255, 140, 140, 0.5);
    background: rgba(140, 20, 20, 0.25);
    color: #ffd6d6;
    padding: 10px 15px;
    border-radius: 10px;
    font-size: 0.85em;
  }

  .auth-footer {
    display: flex;
    justify-content: center;
    gap: 6px;
    font-size: 0.85em;
    color: rgba(225, 232, 235, 0.7);
  }

  .auth-footer a {
    color: white;
  }

  .auth-footer a:hover {
    color: #bbb;
  }

  .auth-forgot {
    align-self: flex-end;
    font-size: 0.8em;
    color: rgba(225, 232, 235, 0.7);
    text-decoration: none;
    margin-top: -12px;
  }

  .auth-forgot:hover {
    color: white;
  }
</style>
