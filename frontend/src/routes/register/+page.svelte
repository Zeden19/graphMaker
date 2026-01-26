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
  successfulToast={{type: "success", title: "Successfully Created Account", subtitle: "You are already logged in"}}
  errorToast={{type: "error", title: "Failed to create account", subtitle: "Please try again."}}
/>
