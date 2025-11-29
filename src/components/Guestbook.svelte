<script lang="ts">
    import { config } from "../lib/store";
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
            alert("Failed to post wish. Please try again.");
        } finally {
            submitting = false;
        }
    }
</script>

{#if $config.showGuestbook}
    <div class="py-10 bg-base-100">
        <div class="container mx-auto px-4 max-w-2xl">
            <h2 class="text-3xl font-bold text-center mb-8">Guestbook</h2>

            <!-- Input Form -->
            <div class="card bg-base-200 shadow-xl mb-8">
                <div class="card-body">
                    <h3 class="card-title text-sm opacity-70">Leave a wish</h3>
                    <input
                        type="text"
                        placeholder="Your Name"
                        class="input input-bordered w-full mb-2"
                        bind:value={newName}
                    />
                    <textarea
                        class="textarea textarea-bordered w-full mb-2"
                        placeholder="Write something sweet..."
                        bind:value={newMessage}
                    ></textarea>
                    <div class="card-actions justify-end">
                        <button
                            class="btn btn-primary btn-sm"
                            on:click={handlePostWish}
                            disabled={submitting || !newName || !newMessage}
                        >
                            {#if submitting}
                                <span class="loading loading-spinner loading-xs"
                                ></span>
                            {/if}
                            Post
                        </button>
                    </div>
                </div>
            </div>

            <!-- List -->
            <div class="flex flex-col gap-4">
                {#each wishes as wish}
                    <div class="chat chat-start">
                        <div class="chat-header">
                            {wish.name}
                            <time class="text-xs opacity-50 ml-1"
                                >{wish.timestamp.toLocaleDateString()}
                                {wish.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}</time
                            >
                        </div>
                        <div class="chat-bubble chat-bubble-secondary">
                            {wish.message}
                        </div>
                    </div>
                {/each}
                {#if wishes.length === 0}
                    <div class="text-center opacity-50 py-10">
                        No wishes yet. Be the first!
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}
