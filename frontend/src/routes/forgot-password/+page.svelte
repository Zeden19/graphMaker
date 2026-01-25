<script>
  import AuthForm from "$lib/components/AuthForm.svelte";
</script>

<AuthForm
  title="Reset your password"
  subtitle="We will send a reset link to your email."
  primaryLabel="Send reset link"
  endpoint="/accounts/forgot-password"
  successRedirect="/login"
  showEmailOnly={true}
  secondaryText="Don't have an account?"
  secondaryLinkText="Register"
  secondaryHref="/register"
/>
