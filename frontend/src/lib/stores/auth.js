import {writable} from 'svelte/store'
export const currentUser = writable(null);
export const authLoading = writable(true);