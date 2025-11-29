<script lang="ts">
    import { config, language } from "../lib/store";
    import { translations } from "../lib/translations";

    $: scheduleItems = [
        {
            time: $config.monkCeremonyTime,
            title: translations[$language].monk_ceremony,
        },
        {
            time: $config.khaenMakCeremonyTime,
            title: translations[$language].khaen_mak_procession,
        },
        {
            time: $config.waterBlessingCeremonyTime,
            title: translations[$language].water_blessing,
        },
        {
            time: $config.dinnerReceptionTime,
            title: translations[$language].dinner_reception,
        },
    ].sort((a, b) => a.time.localeCompare(b.time));
</script>

{#if $config.showSchedule}
    <div class="py-20 bg-base-200 text-base-content font-sans">
        <div class="container mx-auto px-4">
            <h2
                class="text-3xl md:text-4xl font-serif text-center mb-12 text-primary"
            >
                {translations[$language].schedule}
            </h2>

            <div class="max-w-3xl mx-auto">
                <div
                    class="relative border-l-2 border-primary/30 ml-4 md:ml-8 space-y-12"
                >
                    {#each scheduleItems as item}
                        <div class="relative pl-8 md:pl-12 group">
                            <div
                                class="absolute -left-[9px] top-1 w-5 h-5 rounded-full bg-primary border-4 border-base-200 group-hover:scale-125 transition-transform duration-300"
                            ></div>
                            <div
                                class="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 p-4 rounded-lg hover:bg-base-100 transition-colors duration-300"
                            >
                                <span
                                    class="text-2xl font-bold text-primary font-serif min-w-[100px]"
                                    >{item.time}</span
                                >
                                <div>
                                    <h3 class="text-xl font-medium">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
{/if}
