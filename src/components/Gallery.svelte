<script lang="ts">
    import { config, language } from "../lib/store";
    import { translations } from "../lib/translations";

    import { push } from "svelte-spa-router";

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

    import { fade } from "svelte/transition";

    $: images =
        $config.galleryImages.length > 0
            ? $config.galleryImages
            : defaultImages;

    $: displayedImages = images.slice(0, 7);
    $: hasMore = images.length > 7;

    let selectedIndex: number = -1;

    function openImage(index: number) {
        selectedIndex = index;
    }

    function closeImage() {
        selectedIndex = -1;
    }

    function nextImage(e: Event) {
        e.stopPropagation();
        if (selectedIndex < images.length - 1) {
            selectedIndex++;
        } else {
            selectedIndex = 0; // Loop to first
        }
    }

    function prevImage(e: Event) {
        e.stopPropagation();
        if (selectedIndex > 0) {
            selectedIndex--;
        } else {
            selectedIndex = images.length - 1; // Loop to last
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (selectedIndex === -1) return;
        if (e.key === "ArrowRight") nextImage(e);
        if (e.key === "ArrowLeft") prevImage(e);
        if (e.key === "Escape") closeImage();
    }
</script>

<svelte:window on:keydown={handleKeydown} />

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
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="carousel-item cursor-pointer hover:opacity-90 transition-opacity"
                        on:click={() => openImage(i)}
                    >
                        <img
                            src={typeof img === "string" ? img : img.small}
                            alt="{translations[$language].gallery} {i}"
                            class="h-64 lg:h-96 object-cover shadow-md rounded-box"
                        />
                    </div>
                {/each}

                {#if hasMore}
                    <div class="carousel-item">
                        <button
                            class="h-64 lg:h-96 w-48 lg:w-64 bg-base-200 flex flex-col items-center justify-center shadow-md rounded-box hover:bg-base-300 transition-colors cursor-pointer"
                            on:click={() => push("/gallery")}
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

    {#if selectedIndex !== -1}
        {@const selectedImg = images[selectedIndex]}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
            on:click={closeImage}
            transition:fade
        >
            <button
                class="absolute top-4 right-4 btn btn-circle btn-ghost text-white z-50"
                on:click={closeImage}
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

            <!-- Prev Button -->
            <button
                class="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost text-white z-50 flex"
                on:click={prevImage}
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
                on:click={nextImage}
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

            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="contents" on:click|stopPropagation>
                <img
                    src={typeof selectedImg === "string"
                        ? selectedImg
                        : selectedImg.large}
                    alt="Full size"
                    class="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                />
            </div>
        </div>
    {/if}
{/if}
