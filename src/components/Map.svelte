<script lang="ts">
    import { config } from "../lib/store";
</script>

{#if $config.showMap}
    <div id="map" class="py-10 bg-base-100">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-6">Location</h2>
            <div
                class="w-full h-96 rounded-box shadow-xl bg-base-200 overflow-hidden"
            >
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4081.847926327472!2d100.39360219999999!3d13.7800503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29774b4a61b47%3A0x93029fccdf621fa1!2zRmlubiBsJ2Ftb3Vy4oCLIHN0dWRpb-KAiw!5e1!3m2!1sth!2sth!4v1764349516478!5m2!1sth!2sth"
                    width="100%"
                    height="100%"
                    style="border:0;"
                    allowfullscreen={true}
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    title="Wedding Location Map"
                ></iframe>
            </div>
            <div class="text-center mt-4">
                <a
                    href="https://maps.app.goo.gl/HNudUF8ViRUJi5M67"
                    target="_blank"
                    class="btn btn-outline btn-primary"
                >
                    Open in Google Maps
                </a>
            </div>
        </div>
    </div>
{/if}

<style>
    /* No custom styles needed as we use Tailwind classes */
</style>
