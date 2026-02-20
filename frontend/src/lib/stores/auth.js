import {derived, writable} from "svelte/store";
import {apiUrl} from "$lib/api.js";

export const currentUser = writable(null);
export const authLoading = writable(true);
export const resolvedUser = derived(currentUser, ($currentUser) => {
  if ($currentUser && typeof $currentUser.then === "function") {
    return null;
  }
  return $currentUser;
});

let initPromise = null;

export const initCurrentUser = () => {
  if (initPromise) return initPromise;
  const fetchPromise = (async () => {
    let user = null;
    authLoading.set(true);
    try {
      const response = await fetch(apiUrl("/accounts/me"), {credentials: "include"});
      if (response.ok) {
        const payload = await response.json();
        user = payload?.user ?? null;
      }
    } catch {
      user = null;
    } finally {
      currentUser.set(user);
      authLoading.set(false);
    }
    return user;
  })();

  currentUser.set(fetchPromise);
  initPromise = fetchPromise;
  return fetchPromise;
};
