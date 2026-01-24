<script>
  import AuthForm from "$lib/components/AuthForm.svelte";
</script>

<AuthForm
  title="Create your account"
  subtitle="Save graphs, sync them across devices, and share faster."
  primaryLabel="Create account"
  endpoint="/accounts/register"
  successRedirect="/"
  showConfirmPassword={true}
  secondaryText="Already have an account?"
  secondaryLinkText="Log in"
  secondaryHref="/login"
/>
