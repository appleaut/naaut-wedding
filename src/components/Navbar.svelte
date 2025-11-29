<script lang="ts">
  import { language } from "../lib/store";
  import { translations } from "../lib/translations";

  function toggleLanguage() {
    $language = $language === "th" ? "en" : "th";
  }
</script>

<div
  class="navbar bg-wedding-beige/90 backdrop-blur-sm fixed top-0 z-50 text-wedding-dark font-sans shadow-sm"
>
  <div class="flex-1">
    <a
      href="/"
      class="btn btn-ghost text-xl font-serif tracking-widest uppercase"
    >
      NA & AUT
    </a>
  </div>
  <div class="flex-none">
    <button
      class="btn btn-ghost hover:bg-transparent"
      on:click={toggleLanguage}
    >
      <span
        class:font-bold={$language === "th"}
        class:text-wedding-green={$language === "th"}>TH</span
      >
      <span class="mx-1 opacity-50">|</span>
      <span
        class:font-bold={$language === "en"}
        class:text-wedding-green={$language === "en"}>EN</span
      >
    </button>
  </div>
</div>
