<script lang="ts">
  import { auth } from "../lib/firebase";
  import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
  } from "firebase/auth";
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";

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

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content flex-col lg:flex-row-reverse">
    <div class="text-center lg:text-left">
      <h1 class="text-5xl font-bold">Admin Login</h1>
      <p class="py-6">Access the wedding dashboard to manage your event.</p>
    </div>
    <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
      <form class="card-body" on:submit|preventDefault={handleLogin}>
        <div class="form-control">
          <label class="label" for="email">
            <span class="label-text">Email</span>
          </label>
          <input
            type="email"
            id="email"
            placeholder="email"
            class="input input-bordered"
            bind:value={email}
            required
          />
        </div>
        <div class="form-control">
          <label class="label" for="password">
            <span class="label-text">Password</span>
          </label>
          <input
            type="password"
            id="password"
            placeholder="password"
            class="input input-bordered"
            bind:value={password}
            required
          />
          <div class="label">
            <a href="/login#forgot" class="label-text-alt link link-hover"
              >Forgot password?</a
            >
          </div>
        </div>
        {#if error}
          <div class="text-error text-sm">{error}</div>
        {/if}
        <div class="form-control mt-6">
          <button class="btn btn-primary" disabled={loading}>Login</button>
        </div>
      </form>
    </div>
  </div>
</div>
