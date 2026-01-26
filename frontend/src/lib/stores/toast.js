import {writable} from 'svelte/store';

export const toast = writable(null);
export const setToast = (toastObject) => {
  sessionStorage.setItem('flashToast', JSON.stringify(toastObject));
}