<script lang="ts">
    import Navbar from "../components/Navbar.svelte";
    import Footer from "../components/Footer.svelte";
    import { config, language } from "../lib/store";
    import { translations } from "../lib/translations";
    import { push } from "svelte-spa-router";
    import { fade } from "svelte/transition";

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

<Navbar />

<div
    class="min-h-screen bg-wedding-beige text-wedding-dark font-sans pt-20 pb-10"
>
    <div class="container mx-auto px-4">
        <div class="flex items-center mb-8">
            <button class="btn btn-ghost gap-2" on:click={() => push("/")}>
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
                {translations[$language].back}
            </button>
            <h1
                class="text-3xl md:text-4xl font-serif flex-1 text-center pr-12"
            >
                {translations[$language].gallery}
            </h1>
        </div>

        <div
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
            {#each images as img, i}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="aspect-auto group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                    on:click={() => openImage(i)}
                >
                    <img
                        src={typeof img === "string" ? img : img.small}
                        alt="{translations[$language].gallery} {i}"
                        class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                </div>
            {/each}
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
</div>

<Footer />
