<script lang="ts">
  import { language } from "../lib/store";
  import { translations } from "../lib/translations";
</script>

<footer
  class="footer footer-center p-10 bg-wedding-beige text-wedding-dark font-sans"
>
  <aside>
    <p class="font-serif italic text-lg mb-2">
      {translations[$language].thank_you_celebrating}
    </p>
    <p class="text-xs tracking-widest uppercase opacity-60">
      Copyright © {new Date().getFullYear()} NAPAWAN. {translations[$language]
        .all_rights_reserved}
    </p>
  </aside>
</footer>
