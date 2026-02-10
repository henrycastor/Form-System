<script lang="ts">
  import '$lib/css/style.css';
  import Toast from '$lib/components/Toast.svelte';
  import { toasts } from '$lib/components/toast';
  import { onMount } from 'svelte';

  console.log('Layout mounted');
  let { children } = $props();

  // Preserve toast state across page changes
  onMount(() => {
    const unsubscribe = toasts.subscribe((currentToasts) => {
      // Store toasts in sessionStorage to persist across navigation
      if (currentToasts && currentToasts.length > 0) {
        sessionStorage.setItem('toasts', JSON.stringify(currentToasts));
      }
    });

    return () => unsubscribe();
  });

  import { page } from '$app/state';
  import { invalidateAll } from '$app/navigation';

  // Restore toasts from sessionStorage on initial load
  if (typeof sessionStorage !== 'undefined') {
    const savedToasts = sessionStorage.getItem('toasts');
    if (savedToasts) {
      try {
        const parsedToasts = JSON.parse(savedToasts);
        // Only restore toasts if they are not empty and not just success toasts
        if (parsedToasts && parsedToasts.length > 0) {
          const hasNonSuccessToasts = parsedToasts.some((toast: any) => toast.type !== 'success');
          if (hasNonSuccessToasts) {
            toasts.set(parsedToasts);
          }
        }
        // Clear after restoring to avoid duplicates
        sessionStorage.removeItem('toasts');
      } catch (e) {
        console.error('Failed to parse saved toasts:', e);
      }
    }
  }

  let isLoggingOut = false;

  $effect(() => {
    const isAuthenticated = !!page.data.isAuthenticated;
    const isAdminPage = page.url.pathname.startsWith('/painel_administracao');

    // If authenticated and leaving admin page
    if (isAuthenticated && !isAdminPage && !isLoggingOut) {
      isLoggingOut = true;
      const formData = new FormData();
      fetch('/logout', { method: 'POST', body: formData })
        .then(() => {
          return invalidateAll();
        })
        .finally(() => {
          isLoggingOut = false;
        });
    }
  });
</script>

{@render children()}
<Toast />
