<script lang="ts">
  import { language, config } from "../lib/store";
  import { translations, type TranslationKey } from "../lib/translations";
  import QRCode from "./QRCode.svelte";

  function toggleLanguage() {
    $language = $language === "th" ? "en" : "th";
  }

  const menuItems: Record<string, TranslationKey> = {
    Countdown: "home",

    Schedule: "schedule",
    Map: "map",
    Gallery: "gallery",
    Video: "video",
    RSVP: "rsvp",
    QRCode: "guestbook",
  };

  const defaultOrder = [
    "Countdown",
    "EventDetails",
    "Schedule",
    "Map",
    "Gallery",
    "Video",
    "QRCode",
    "RSVP",
    "Guestbook",
  ];

  const sectionVisibility: Record<string, string> = {
    Countdown: "showCountdown",
    EventDetails: "showEventDetails",
    Schedule: "showSchedule",
    Map: "showMap",
    Gallery: "showGallery",
    Video: "showVideo",
    QRCode: "showQRCode",
    RSVP: "showRSVP",
    Guestbook: "showGuestbook",
  };

  function isSectionVisible(section: string) {
    return ($config as any)[sectionVisibility[section]];
  }

  $: t = translations[$language];
  $: sections = $config.sectionOrder || defaultOrder;
</script>

<div
  class="navbar bg-wedding-beige/90 backdrop-blur-sm fixed top-0 z-50 text-wedding-dark font-sans shadow-sm"
>
  <div class="navbar-start">
    <a
      href="/"
      class="btn btn-ghost text-xl font-serif tracking-widest uppercase"
    >
      NA & AUT
    </a>
  </div>

  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      {#each sections as section}
        {#if menuItems[section] && isSectionVisible(section)}
          <li>
            <a
              href="#{section.toLowerCase()}"
              class="uppercase tracking-wider text-sm hover:text-wedding-green"
            >
              {t[menuItems[section]]}
            </a>
          </li>
        {/if}
      {/each}
    </ul>
  </div>

  <div class="navbar-end gap-2">
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

    <div class="dropdown dropdown-end lg:hidden">
      <div role="button" tabindex="0" class="btn btn-ghost">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h8m-8 6h16"
          />
        </svg>
      </div>
      <ul
        tabindex="0"
        role="menu"
        class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white rounded-box w-52"
      >
        {#each sections as section}
          {#if menuItems[section] && isSectionVisible(section)}
            <li>
              <a href="#{section.toLowerCase()}">{t[menuItems[section]]}</a>
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  </div>
</div>
