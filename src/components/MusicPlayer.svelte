<script lang="ts">
    import { onMount } from "svelte";

    let playing = true;
    let audio: HTMLAudioElement;

    onMount(() => {
        audio.play().catch(() => {
            playing = false;
        });
    });
    // Use a royalty free music or placeholder
    const musicUrl =
        "https://firebasestorage.googleapis.com/v0/b/napawan-wedding.firebasestorage.app/o/song%2FFinding%20-%20Nat%20Keefe.mp3?alt=media&token=f9af3878-7210-46c6-b5d8-6bbc9614ef73";

    function togglePlay() {
        if (playing) {
            audio.pause();
        } else {
            audio.play();
        }
        playing = !playing;
    }
</script>

<div class="fixed bottom-4 right-4 z-50">
    <audio bind:this={audio} src={musicUrl} loop></audio>
    <button class="btn btn-circle btn-primary shadow-lg" on:click={togglePlay}>
        {#if playing}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                />
            </svg>
        {:else}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                />
            </svg>
        {/if}
    </button>
</div>
