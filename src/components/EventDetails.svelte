<script lang="ts">
  import { config, language } from "../lib/store";
  import { translations } from "../lib/translations";
  import { format } from "date-fns";
  import { th, enGB } from "date-fns/locale";

  let selectedColor: string | null = null;
</script>

{#if $config.showEventDetails}
  <div class="hero bg-white py-20 text-wedding-dark font-sans">
    <div class="hero-content flex-col w-full max-w-4xl">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full text-center"
      >
        <div class="flex flex-col items-center p-8 border border-wedding-beige">
          <div class="mb-4 text-wedding-green">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-8 h-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          </div>
          <h3 class="text-xl font-serif mb-2">
            {translations[$language].save_the_date}
          </h3>
          <p class="text-lg">
            {format(new Date($config.weddingDate), "dd MMMM yyyy", {
              locale: $language === "th" ? th : enGB,
            })}
          </p>
          <p class="text-sm opacity-60 uppercase tracking-widest mt-1">
            {format(new Date($config.weddingDate), "EEEE", {
              locale: $language === "th" ? th : enGB,
            })}
          </p>
        </div>

        <div class="flex flex-col items-center p-8 border border-wedding-beige">
          <div class="mb-4 text-wedding-green">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-8 h-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-serif mb-2">
            {translations[$language].schedule}
          </h3>
          <p class="text-lg">
            {format(new Date($config.weddingDate), "HH:mm")}
          </p>
          <a
            href="#schedule"
            class="text-sm opacity-60 uppercase tracking-widest mt-1 underline hover:text-wedding-green"
          >
            {translations[$language].ceremony}
          </a>
        </div>

        <div class="flex flex-col items-center p-8 border border-wedding-beige">
          <div class="mb-4 text-wedding-green">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-8 h-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-serif mb-2">
            {translations[$language].location}
          </h3>
          <p class="text-lg">
            {$config.weddingLocation}
          </p>
          <a
            href="#map"
            class="text-sm opacity-60 uppercase tracking-widest mt-1 underline hover:text-wedding-green"
          >
            {translations[$language].see_map}
          </a>
        </div>

        <div class="flex flex-col items-center p-8 border border-wedding-beige">
          <div class="mb-4 text-wedding-green">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-8 h-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-serif mb-2">
            {translations[$language].dress_code}
          </h3>
          <div class="flex gap-3 justify-center mt-2">
            {#if $config.dressCodeColors}
              {#each $config.dressCodeColors as color}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                  class="w-8 h-8 rounded-full border border-gray-200 shadow-sm cursor-pointer transition-transform hover:scale-110"
                  style="background-color: {color};"
                  title={color}
                  on:click={() => (selectedColor = color)}
                ></div>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>

  {#if selectedColor}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all"
      on:click={() => (selectedColor = null)}
    >
      <div
        class="relative w-64 h-64 rounded-full shadow-2xl border-4 border-white transform transition-all scale-100"
        style="background-color: {selectedColor};"
        on:click|stopPropagation
      >
        <button
          class="absolute -top-12 left-1/2 -translate-x-1/2 text-white opacity-80 hover:opacity-100"
          on:click={() => (selectedColor = null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-10 h-10"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  {/if}

{/if}
