<script lang="ts">
  import { config } from '../lib/store';
  import { onMount } from 'svelte';
  
  // Mock data
  let wishes = [
    { name: "Friend 1", message: "Congratulations on your big day!", timestamp: new Date() },
    { name: "Relative A", message: "Wishing you a lifetime of happiness.", timestamp: new Date() }
  ];

  let newName = '';
  let newMessage = '';
  let submitting = false;

  async function handlePostWish() {
      if (!newName || !newMessage) return;
      submitting = true;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      wishes = [{ name: newName, message: newMessage, timestamp: new Date() }, ...wishes];
      newName = '';
      newMessage = '';
      submitting = false;
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
                <input type="text" placeholder="Your Name" class="input input-bordered w-full mb-2" bind:value={newName} />
                <textarea class="textarea textarea-bordered w-full mb-2" placeholder="Write something sweet..." bind:value={newMessage}></textarea>
                <div class="card-actions justify-end">
                    <button class="btn btn-primary btn-sm" on:click={handlePostWish} disabled={submitting || !newName || !newMessage}>Post</button>
                </div>
            </div>
        </div>

        <!-- List -->
        <div class="flex flex-col gap-4">
            {#each wishes as wish}
                <div class="chat chat-start">
                    <div class="chat-header">
                        {wish.name}
                        <time class="text-xs opacity-50 ml-1">{wish.timestamp.toLocaleDateString()}</time>
                    </div>
                    <div class="chat-bubble chat-bubble-secondary">{wish.message}</div>
                </div>
            {/each}
        </div>
    </div>
</div>
{/if}
