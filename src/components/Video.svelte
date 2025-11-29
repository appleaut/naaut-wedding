<script lang="ts">
    import { config, language } from "../lib/store";
    import { translations } from "../lib/translations";

    function getEmbedUrl(url: string) {
        if (!url) return "";

        // Handle YouTube URLs
        const youtubeRegex =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(youtubeRegex);

        if (match && match[1]) {
            return `https://www.youtube-nocookie.com/embed/${match[1]}`;
        }

        return url;
    }
</script>

{#if $config.showVideo && $config.videoUrl}
    <div class="py-10 bg-base-100">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold mb-8">
                {translations[$language].our_story}
            </h2>
            <div class="w-full max-w-4xl mx-auto aspect-video">
                <iframe
                    class="w-full h-full rounded-box shadow-xl"
                    src={getEmbedUrl($config.videoUrl)}
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                >
                </iframe>
            </div>
        </div>
    </div>
{/if}
