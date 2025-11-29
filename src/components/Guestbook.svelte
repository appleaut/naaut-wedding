<script lang="ts">
    import { config, language } from "../lib/store";
    import { translations } from "../lib/translations";
    import { onMount, onDestroy } from "svelte";
    import { db } from "../lib/firebase";
    import {
        collection,
        addDoc,
        query,
        orderBy,
        onSnapshot,
    } from "firebase/firestore";

    let wishes: any[] = [];
    let newName = "";
    let newMessage = "";
    let submitting = false;
    let unsubscribe: () => void;

    $: t = translations[$language];

    onMount(() => {
        const q = query(
            collection(db, "guestbook"),
            orderBy("timestamp", "desc"),
        );
        unsubscribe = onSnapshot(q, (snapshot) => {
            wishes = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Handle Firestore Timestamp or JS Date
                    timestamp: data.timestamp?.toDate
                        ? data.timestamp.toDate()
                        : new Date(data.timestamp) || new Date(),
                };
            });
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    async function handlePostWish() {
        if (!newName || !newMessage) return;
        submitting = true;

        try {
            await addDoc(collection(db, "guestbook"), {
                name: newName,
                message: newMessage,
                timestamp: new Date(),
            });

            newName = "";
            newMessage = "";
        } catch (error) {
            console.error("Error adding document: ", error);
            alert(t.post_wish_error);
        } finally {
            submitting = false;
        }
    }
</script>

{#if $config.showGuestbook}
    <div class="py-20 bg-wedding-beige font-sans text-wedding-dark">
        <div class="container mx-auto px-4 max-w-2xl">
            <h2 class="text-3xl md:text-4xl font-serif text-center mb-12">
                {t.guestbook}
            </h2>

            <!-- Input Form -->
            <div class="card bg-white shadow-sm rounded-none mb-12">
                <div class="card-body">
                    <h3
                        class="card-title text-sm opacity-70 font-serif uppercase tracking-widest mb-4"
                    >
                        {t.leave_a_wish}
                    </h3>
                    <input
                        type="text"
                        placeholder={t.your_name}
                        class="input input-bordered w-full mb-2 bg-wedding-beige rounded-none focus:outline-none focus:border-wedding-dark"
                        bind:value={newName}
                    />
                    <textarea
                        class="textarea textarea-bordered w-full mb-4 bg-wedding-beige rounded-none focus:outline-none focus:border-wedding-dark"
                        placeholder={t.write_something_sweet}
                        bind:value={newMessage}
                    ></textarea>
                    <div class="card-actions justify-end">
                        <button
                            class="btn bg-wedding-dark text-white hover:bg-black rounded-none border-none"
                            on:click={handlePostWish}
                            disabled={submitting || !newName || !newMessage}
                        >
                            {#if submitting}
                                <span class="loading loading-spinner loading-xs"
                                ></span>
                            {/if}
                            {t.post}
                        </button>
                    </div>
                </div>
            </div>

            <!-- List -->
            <div class="flex flex-col gap-6">
                {#each wishes as wish}
                    <div class="chat chat-start">
                        <div class="chat-header mb-1">
                            <span class="font-serif text-lg">{wish.name}</span>
                            <time
                                class="text-xs opacity-50 ml-1 uppercase tracking-wider"
                                >{wish.timestamp.toLocaleDateString()}
                                {wish.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}</time
                            >
                        </div>
                        <div
                            class="chat-bubble bg-white text-wedding-dark rounded-none shadow-sm"
                        >
                            {wish.message}
                        </div>
                    </div>
                {/each}
                {#if wishes.length === 0}
                    <div class="text-center opacity-50 py-10 font-serif italic">
                        {t.no_wishes_yet}
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}
