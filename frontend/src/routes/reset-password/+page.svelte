<script>
  import {page} from "$app/state";
  import AuthForm from "$lib/components/AuthForm.svelte";

  const token = $derived(page.url.searchParams.get("token") ?? "");
</script>

<AuthForm title="Set a new password"
          subtitle="Choose a strong password to secure your account"
          primaryLabel="Reset Password"
          endpoint="/accounts/reset-password"
          showConfirmPassword={true}
          successRedirect="/login"
          resetPassword={true}
          {token}
          successfulToast={{type: "success", title: "Successfully reset password", subtitle: "Log in with your new password."}}
          errorToast={{type: "error", title: "Could not reset password", subtitle: "Please try sending the email again"}}

/>
