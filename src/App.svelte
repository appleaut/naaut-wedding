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

  const routes = {
    "/": Home,
    "/admin": Admin,
    "/login": Login,
  };

  let isLoading = true;

  onMount(async () => {
    try {
      const docRef = doc(db, "config", "main");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        config.set(docSnap.data() as any);
      }
    } catch (e) {
      console.error("Error loading config:", e);
    } finally {
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <LoadingSkeleton />
{:else}
  <Router {routes} />
{/if}
