<script lang="ts">
  import "$lib/css/style.css";
  import Toast from "$lib/components/Toast.svelte";
  import { toasts } from "$lib/components/toast";
  import { onMount } from "svelte";

  console.log("Layout mounted");
  let { children } = $props();

  // Preserve toast state across page changes
  onMount(() => {
    const unsubscribe = toasts.subscribe((currentToasts) => {
      // Store toasts in sessionStorage to persist across navigation
      if (currentToasts && currentToasts.length > 0) {
        sessionStorage.setItem("toasts", JSON.stringify(currentToasts));
      }
    });

    return () => unsubscribe();
  });

  // Restore toasts from sessionStorage on initial load
  if (typeof sessionStorage !== "undefined") {
    const savedToasts = sessionStorage.getItem("toasts");
    if (savedToasts) {
      try {
        const parsedToasts = JSON.parse(savedToasts);
        // Only restore toasts if they are not empty and not just success toasts
        if (parsedToasts && parsedToasts.length > 0) {
          const hasNonSuccessToasts = parsedToasts.some(
            (toast: any) => toast.type !== "success",
          );
          if (hasNonSuccessToasts) {
            toasts.set(parsedToasts);
          }
        }
        // Clear after restoring to avoid duplicates
        sessionStorage.removeItem("toasts");
      } catch (e) {
        console.error("Failed to parse saved toasts:", e);
      }
    }
  }
</script>

{@render children()}
<Toast />
