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

    $: displayedImages = images.slice(0, 7);
    $: hasMore = images.length > 7;

    let showModal = false;
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
                {#each displayedImages as img, i}
                    <div class="carousel-item">
                        <img
                            src={img}
                            alt="{translations[$language].gallery} {i}"
                            class="h-64 lg:h-96 object-cover shadow-md rounded-box"
                        />
                    </div>
                {/each}

                {#if hasMore}
                    <div class="carousel-item">
                        <button
                            class="h-64 lg:h-96 w-48 lg:w-64 bg-base-200 flex flex-col items-center justify-center shadow-md rounded-box hover:bg-base-300 transition-colors cursor-pointer"
                            on:click={() => (showModal = true)}
                        >
                            <span class="text-xl font-serif mb-2"
                                >{translations[$language].view_all}</span
                            >
                            <span class="text-sm opacity-60"
                                >+{images.length - 7}</span
                            >
                        </button>
                    </div>
                {/if}
            </div>
            <p
                class="text-center mt-4 text-sm opacity-60 font-serif italic tracking-wider"
            >
                {translations[$language].swipe_to_see_more}
            </p>
        </div>
    </div>

    <!-- Full Gallery Modal -->
    {#if showModal}
        <dialog class="modal modal-open">
            <div
                class="modal-box w-11/12 max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-base-100"
            >
                <div class="p-4 flex justify-between items-center border-b">
                    <h3 class="font-bold text-lg">
                        {translations[$language].gallery}
                    </h3>
                    <button
                        class="btn btn-sm btn-circle btn-ghost"
                        on:click={() => (showModal = false)}>✕</button
                    >
                </div>
                <div class="flex-1 overflow-y-auto p-4">
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                        {#each images as img, i}
                            <div class="aspect-auto">
                                <img
                                    src={img}
                                    alt="{translations[$language].gallery} {i}"
                                    class="w-full h-full object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    loading="lazy"
                                />
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button on:click={() => (showModal = false)}>close</button>
            </form>
        </dialog>
    {/if}
{/if}
