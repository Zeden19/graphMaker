<script>
  import AuthForm from "$lib/components/AuthForm.svelte";
</script>

<AuthForm
  title="Welcome back"
  subtitle="Log in to manage and save your graphs."
  primaryLabel="Log in"
  endpoint="/accounts/login"
  successRedirect="/"
  showForgotPassword={true}
  forgotHref="/forgot-password"
  secondaryText="Need an account?"
  secondaryLinkText="Create one"
  secondaryHref="/register"
/>
