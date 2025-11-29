<script lang="ts">
  import { config, language } from "../lib/store";
  import { translations } from "../lib/translations";
  import banner from "../static/img/banner.jpg";
</script>

<div
  class="hero min-h-screen font-serif"
  style="background-image: url({banner});"
>
  <div class="hero-overlay bg-black/40"></div>
  <div class="hero-content text-center text-white">
    <div class="max-w-2xl">
      <p class="mb-4 text-sm md:text-base tracking-[0.2em] uppercase">
        {$language === "th"
          ? "มีความยินดีขอเรียนเชิญเพื่อเป็นเกียรติและร่วมรับประทานอาหาร เนื่องในงานพิธีมงคลสมรส"
          : "We kindly request the pleasure of your company and invite you to a celebratory dinner for our wedding."}
      </p>
      <h1 class="mb-6 text-6xl md:text-8xl font-bold leading-tight">
        {$config.brideNickname}
        <span class="text-4xl md:text-6xl align-middle">&</span>
        {$config.groomNickname}
      </h1>
      <div class="flex flex-col gap-2 mb-8">
        <p class="text-xl md:text-2xl tracking-widest">
          {new Date($config.weddingDate)
            .toLocaleDateString($language === "th" ? "th-TH" : "en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })
            .replace(/\//g, ".")}
        </p>
        <p class="text-lg md:text-xl italic opacity-90">
          {$config.weddingLocation}
        </p>
      </div>
      <div class="mt-8">
        <a
          href="#rsvp"
          class="btn btn-outline text-white border-white hover:bg-white hover:text-wedding-dark hover:border-white rounded-none px-8 tracking-widest"
        >
          {translations[$language].rsvp}
        </a>
      </div>
    </div>
  </div>
</div>
