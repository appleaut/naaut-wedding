<script lang="ts">
    import { config, language } from "../lib/store";
    import { onMount, onDestroy } from "svelte";
    import { generatePayload } from "../lib/promptpay";
    import { parseDate } from "../lib/date";
    import { translations } from "../lib/translations";

    let show = false;
    let interval: any;

    $: payload = generatePayload($config.bankAccount.accountNumber);
    $: qrUrl = payload
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`
        : "";

    function checkTime() {
        const now = new Date();
        const start = parseDate($config.qrCodeStartTime);
        const end = parseDate($config.qrCodeEndTime);
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
            <h2 class="text-3xl font-bold mb-4">
                {translations[$language].gift_for_couple}
            </h2>
            <p class="mb-8">{translations[$language].scan_to_gift}</p>

            <div class="card bg-base-100 w-64 mx-auto shadow-xl">
                <figure class="px-10 pt-10">
                    {#if qrUrl}
                        <img
                            src={qrUrl}
                            alt="PromptPay QR Code"
                            class="rounded-xl"
                        />
                    {:else}
                        <div
                            class="w-[150px] h-[150px] bg-base-200 flex items-center justify-center rounded-xl text-base-content"
                        >
                            <span class="text-xs"
                                >{translations[$language]
                                    .invalid_account_no}</span
                            >
                        </div>
                    {/if}
                </figure>
                <div
                    class="card-body items-center text-center text-base-content"
                >
                    <h2 class="card-title">{$config.bankAccount.bankName}</h2>
                    <p>{$config.bankAccount.accountName}</p>
                    <p class="font-mono bg-base-200 p-2 rounded">
                        {$config.bankAccount.accountNumber}
                    </p>
                </div>
            </div>
        </div>
    </div>
{/if}
