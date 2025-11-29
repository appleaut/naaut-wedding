<script lang="ts">
  import { auth } from "../lib/firebase";
  import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
  } from "firebase/auth";
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import banner from "../static/img/login_background.png";

  let email = "";
  let password = "";
  let error = "";
  let loading = false;

  let isResetting = false;
  let resetEmail = "";
  let resetMessage = "";
  let resetError = "";
  let resetLoading = false;

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.removeItem("adminActiveTab");
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
      localStorage.removeItem("adminActiveTab");
      push("/admin");
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function handleResetPassword() {
    resetLoading = true;
    resetMessage = "";
    resetError = "";
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      resetMessage = "Password reset link sent to your email.";
    } catch (e: any) {
      resetError = e.message;
    } finally {
      resetLoading = false;
    }
  }

  function toggleReset() {
    isResetting = !isResetting;
    resetEmail = email;
    resetMessage = "";
    resetError = "";
    error = "";
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
      {#if !isResetting}
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
            <div class="label">
              <a
                href={"#"}
                class="label-text-alt link link-hover"
                on:click|preventDefault={toggleReset}>Forgot password?</a
              >
            </div>
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
      {:else}
        <form class="card-body" on:submit|preventDefault={handleResetPassword}>
          <h2 class="card-title justify-center mb-4">Reset Password</h2>
          <p class="text-center text-sm mb-4 text-base-content/70">
            Enter your email to receive a password reset link.
          </p>
          <div class="form-control">
            <label class="label" for="reset-email">
              <span class="label-text font-medium">Email</span>
            </label>
            <input
              type="email"
              id="reset-email"
              placeholder="email@example.com"
              class="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary"
              bind:value={resetEmail}
              required
            />
          </div>
          {#if resetMessage}
            <div class="alert alert-success text-sm mt-2 shadow-lg rounded-lg">
              <span>{resetMessage}</span>
            </div>
          {/if}
          {#if resetError}
            <div class="alert alert-error text-sm mt-2 shadow-lg rounded-lg">
              <span>{resetError}</span>
            </div>
          {/if}
          <div class="form-control mt-6">
            <button
              class="btn btn-primary btn-block text-lg font-normal uppercase tracking-widest"
              disabled={resetLoading}
            >
              {#if resetLoading}
                <span class="loading loading-spinner"></span>
              {:else}
                Send Link
              {/if}
            </button>
          </div>
          <div class="form-control mt-2">
            <button
              class="btn btn-ghost"
              on:click|preventDefault={toggleReset}
              type="button">Back to Login</button
            >
          </div>
        </form>
      {/if}
    </div>
  </div>
</div>
