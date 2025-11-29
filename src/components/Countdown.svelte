<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { config, language } from "../lib/store";
  import { translations } from "../lib/translations";

  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  let interval: number;

  function calculateTimeLeft() {
    const targetDate = new Date($config.weddingDate);
    const difference = +targetDate - +new Date();

    if (isNaN(difference)) {
      return;
    }

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  }

  $: $config.weddingDate, calculateTimeLeft();

  onMount(() => {
    calculateTimeLeft();
    interval = setInterval(calculateTimeLeft, 1000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

{#if $config.showCountdown}
  <div class="py-20 bg-wedding-beige text-wedding-dark text-center">
    <h2 class="text-2xl md:text-3xl font-serif italic mb-12 tracking-wide">
      {translations[$language].countdown_title}
    </h2>
    <div
      class="grid grid-flow-col gap-8 md:gap-16 text-center auto-cols-max justify-center"
    >
      <div class="flex flex-col">
        <span class="font-serif text-4xl md:text-6xl mb-2">
          {timeLeft.days}
        </span>
        <span class="text-xs md:text-sm uppercase tracking-widest opacity-70"
          >{translations[$language].days}</span
        >
      </div>
      <div class="flex flex-col">
        <span class="font-serif text-4xl md:text-6xl mb-2">
          {timeLeft.hours}
        </span>
        <span class="text-xs md:text-sm uppercase tracking-widest opacity-70"
          >{translations[$language].hours}</span
        >
      </div>
      <div class="flex flex-col">
        <span class="font-serif text-4xl md:text-6xl mb-2">
          {timeLeft.minutes}
        </span>
        <span class="text-xs md:text-sm uppercase tracking-widest opacity-70"
          >{translations[$language].minutes}</span
        >
      </div>
      <div class="flex flex-col">
        <span class="font-serif text-4xl md:text-6xl mb-2">
          {timeLeft.seconds}
        </span>
        <span class="text-xs md:text-sm uppercase tracking-widest opacity-70"
          >{translations[$language].seconds}</span
        >
      </div>
    </div>
  </div>
{/if}
