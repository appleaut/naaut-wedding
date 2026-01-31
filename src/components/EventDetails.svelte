<script lang="ts">
  import { config, language } from "../lib/store";
  import { translations } from "../lib/translations";
  import { format } from "date-fns";
  import { th, enGB } from "date-fns/locale";

  import { fade } from "svelte/transition";

  let selectedColor: string | null = null;
  
  $: cardImages = $config.weddingCardImages || [];
  let showCard = false;
  let currentCardIndex = 0;

  function openCard(index: number = 0) {
    if (cardImages.length > 0) {
      currentCardIndex = index;
      showCard = true;
    }
  }

  function closeCard() {
    showCard = false;
  }

  function nextCard(e: Event) {
    e.stopPropagation();
    if (currentCardIndex < cardImages.length - 1) {
      currentCardIndex++;
    } else {
      currentCardIndex = 0;
    }
  }

  function prevCard(e: Event) {
    e.stopPropagation();
    if (currentCardIndex > 0) {
      currentCardIndex--;
    } else {
      currentCardIndex = cardImages.length - 1;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (showCard) {
        if (e.key === "ArrowRight") nextCard(e);
        if (e.key === "ArrowLeft") prevCard(e);
        if (e.key === "Escape") closeCard();
    }
  }
</script>

{#if $config.showEventDetails}
  <div class="hero bg-white py-20 text-wedding-dark font-sans">
    <div class="hero-content flex-col w-full max-w-[90rem]">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 w-full text-center"
      >
        <div class="flex flex-col items-center p-8 border border-wedding-beige h-full">
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

        <div class="flex flex-col items-center p-8 border border-wedding-beige h-full">
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

        <div class="flex flex-col items-center p-8 border border-wedding-beige h-full">
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
          <p class="text-lg truncate max-w-[200px]">
            {$config.weddingLocation}
          </p>
          <a
            href="#map"
            class="text-sm opacity-60 uppercase tracking-widest mt-1 underline hover:text-wedding-green"
          >
            {translations[$language].see_map}
          </a>
        </div>

        <div class="flex flex-col items-center p-8 border border-wedding-beige h-full">
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
          <div class="grid grid-cols-6 lg:grid-cols-3 xl:grid-cols-6 gap-4 justify-items-center mt-2">
            {#if $config.dressCodeColors}
              {#each $config.dressCodeColors as color}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                  class="w-8 h-8 rounded-full border shadow-sm cursor-pointer transition-transform hover:scale-110"
                  style="background-color: {color}; border-color: {color};"
                  title={color}
                  on:click={() => (selectedColor = color)}
                ></div>
              {/each}
            {/if}
          </div>
        </div>

        {#if $config.showWeddingCard}
        <div class="flex flex-col items-center p-8 border border-wedding-beige h-full">
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
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-serif mb-2">
            {translations[$language].wedding_card}
          </h3>
          <div class="text-center">
             {#if $config.weddingCardImages && $config.weddingCardImages.length > 0}
               <button
                 class="text-sm opacity-60 uppercase tracking-widest mt-1 underline hover:text-wedding-green"
                 on:click={() => openCard(0)}
               >
                 {translations[$language].view_wedding_card}
               </button>
             {:else}
                <span class="text-sm opacity-60 italic">-</span>
             {/if}
           </div>
        </div>
        {/if}
      </div>
    </div>
  </div>

  {#if selectedColor}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all"
      on:click={() => (selectedColor = null)}
    >
      <button
        class="absolute left-4 md:left-1/4 text-white opacity-80 hover:opacity-100 p-2"
        on:click|stopPropagation={() => {
          const colors = $config.dressCodeColors;
          const currentIndex = colors.findIndex((c) => c === selectedColor);
          const prevIndex = (currentIndex - 1 + colors.length) % colors.length;
          selectedColor = colors[prevIndex];
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-10 h-10 md:w-12 md:h-12"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      <div
        class="relative w-64 h-64 rounded-full shadow-2xl border-4 border-white transform transition-all scale-100"
        style="background-color: {selectedColor};"
        on:click|stopPropagation
      >
        <button
          class="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white opacity-80 hover:opacity-100"
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

      <button
        class="absolute right-4 md:right-1/4 text-white opacity-80 hover:opacity-100 p-2"
        on:click|stopPropagation={() => {
          const colors = $config.dressCodeColors;
          const currentIndex = colors.findIndex((c) => c === selectedColor);
          const nextIndex = (currentIndex + 1) % colors.length;
          selectedColor = colors[nextIndex];
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-10 h-10 md:w-12 md:h-12"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
    </div>
  {/if}

{/if}

{#if showCard && cardImages.length > 0}
    {@const selectedImg = cardImages[currentCardIndex]}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4"
        transition:fade
    >
        <button
            class="absolute top-4 right-4 btn btn-circle btn-ghost text-white z-50"
            on:click={closeCard}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        </button>

        {#if cardImages.length > 1}
            <!-- Prev Button -->
            <button
                class="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost text-white z-50 flex"
                on:click={prevCard}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>

            <!-- Next Button -->
            <button
                class="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost text-white z-50 flex"
                on:click={nextCard}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        {/if}

        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="contents" on:click|stopPropagation>
            <img
                src={typeof selectedImg === "string"
                    ? selectedImg
                    : selectedImg.large}
                alt="Wedding Card"
                class="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />
        </div>
        
        <div class="absolute bottom-4 left-0 right-0 text-center text-white/50 text-sm">
            {currentCardIndex + 1} / {cardImages.length}
        </div>
    </div>
{/if}

<svelte:window on:keydown={handleKeydown} />
