<script lang="ts">
  import { auth } from "../lib/firebase";
  import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
  } from "firebase/auth";
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import banner from "../static/img/login_background.png";

  let email = "";
  let password = "";
  let error = "";
  let loading = false;

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        push("/admin");
      }
    });
    return unsubscribe;
  });

  async function handleLogin() {
    loading = true;
    error = "";
    try {
      await signInWithEmailAndPassword(auth, email, password);
      push("/admin");
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div
  class="hero min-h-screen font-serif"
  style="background-image: url({banner});"
>
  <div class="hero-overlay bg-black/60 backdrop-blur-sm"></div>
  <div class="hero-content flex-col">
    <div class="text-center mb-8">
      <h1
        class="text-5xl md:text-6xl font-bold text-white mb-2 font-['Playfair_Display']"
      >
        Admin Login
      </h1>
      <p class="text-white/80 text-lg tracking-wide">
        Manage your wedding details
      </p>
    </div>
    <div
      class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100/95 backdrop-blur"
    >
      <form class="card-body" on:submit|preventDefault={handleLogin}>
        <div class="form-control">
          <label class="label" for="email">
            <span class="label-text font-medium">Email</span>
          </label>
          <input
            type="email"
            id="email"
            placeholder="email@example.com"
            class="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary"
            bind:value={email}
            required
          />
        </div>
        <div class="form-control">
          <label class="label" for="password">
            <span class="label-text font-medium">Password</span>
          </label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            class="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary"
            bind:value={password}
            required
          />
        </div>
        {#if error}
          <div class="alert alert-error text-sm mt-2 shadow-lg rounded-lg">
            <span>{error}</span>
          </div>
        {/if}
        <div class="form-control mt-8">
          <button
            class="btn btn-primary btn-block text-lg font-normal uppercase tracking-widest"
            disabled={loading}
          >
            {#if loading}
              <span class="loading loading-spinner"></span>
            {:else}
              Sign In
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
