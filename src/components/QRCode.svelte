<script lang="ts">
  import { config } from '../lib/store';
  import { onMount, onDestroy } from 'svelte';

  let show = false;
  let interval: number;

  function checkTime() {
      const now = new Date();
      const start = new Date($config.qrCodeStartTime);
      const end = new Date($config.qrCodeEndTime);
      show = now >= start && now <= end;
  }

  onMount(() => {
      checkTime();
      interval = setInterval(checkTime, 60000); // Check every minute
  });

  onDestroy(() => {
      clearInterval(interval);
  });
</script>

{#if $config.showQRCode && show}
<div class="py-10 bg-primary text-primary-content">
    <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">Gift for the Couple</h2>
        <p class="mb-8">Scan to send a gift</p>
        
        <div class="card bg-base-100 w-64 mx-auto shadow-xl">
            <figure class="px-10 pt-10">
                <!-- Placeholder QR Code -->
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example" alt="QR Code" class="rounded-xl" />
            </figure>
            <div class="card-body items-center text-center text-base-content">
                <h2 class="card-title">{$config.bankAccount.bankName}</h2>
                <p>{$config.bankAccount.accountName}</p>
                <p class="font-mono bg-base-200 p-2 rounded">{$config.bankAccount.accountNumber}</p>
            </div>
        </div>
    </div>
</div>
{/if}
