<script lang="ts">
  import Router from "svelte-spa-router";
  import Home from "./routes/Home.svelte";
  import Admin from "./routes/Admin.svelte";
  import Login from "./routes/Login.svelte";
  import LoadingSkeleton from "./components/LoadingSkeleton.svelte";
  import { onMount } from "svelte";
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "./lib/firebase";
  import { config } from "./lib/store";

  import GalleryPage from "./routes/GalleryPage.svelte";

  const routes = {
    "/": Home,
    "/admin": Admin,
    "/login": Login,
    "/gallery": GalleryPage,
  };

  let isLoading = true;

  onMount(async () => {
    // Set a timeout to ensure we don't get stuck on loading screen
    const timeout = setTimeout(() => {
      console.warn("Config load timed out, using defaults");
      isLoading = false;
    }, 3000);

    try {
      const docRef = doc(db, "config", "main");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        config.set(docSnap.data() as any);
      }
    } catch (e) {
      console.error("Error loading config:", e);
    } finally {
      clearTimeout(timeout);
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <LoadingSkeleton />
{:else}
  <Router {routes} />
{/if}
