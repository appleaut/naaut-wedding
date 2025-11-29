<script lang="ts">
    import { config, language } from "../lib/store";
    import { translations } from "../lib/translations";

    // Mock images if none provided
    const defaultImages = [
        "https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp",
        "https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp",
        "https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp",
        "https://img.daisyui.com/images/stock/photo-1494253109108-2e30c049369b.webp",
        "https://img.daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.webp",
        "https://img.daisyui.com/images/stock/photo-1559181567-c3190ca9959b.webp",
        "https://img.daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.webp",
    ];

    $: images =
        $config.galleryImages.length > 0
            ? $config.galleryImages
            : defaultImages;
</script>

{#if $config.showGallery}
    <div class="py-20 bg-wedding-beige text-wedding-dark font-sans">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-serif text-center mb-12">
                {translations[$language].gallery}
            </h2>

            <div
                class="carousel carousel-center w-full p-4 space-x-4 bg-transparent"
            >
                {#each images as img, i}
                    <div class="carousel-item">
                        <img
                            src={img}
                            alt="{translations[$language].gallery} {i}"
                            class="h-64 lg:h-96 object-cover shadow-md"
                        />
                    </div>
                {/each}
            </div>
            <p
                class="text-center mt-4 text-sm opacity-60 font-serif italic tracking-wider"
            >
                {translations[$language].swipe_to_see_more}
            </p>
        </div>
    </div>
{/if}
