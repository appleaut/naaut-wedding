<script lang="ts">
    import { config, language } from "../lib/store";
    import { translations } from "../lib/translations";
    import { format } from "date-fns";
    import { th, enGB } from "date-fns/locale";

    function formatDateTime(isoString: string) {
        if (!isoString) return { time: "", date: "" };
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return { time: isoString, date: "" };

        return {
            time: format(date, "HH:mm"),
            date: format(date, "d MMM yyyy", {
                locale: $language === "th" ? th : enGB,
            }),
        };
    }

    $: scheduleItems = ($config.schedule || [])
        .map((item: any) => ({
            raw: item.time,
            ...formatDateTime(item.time),
            title: item.title,
        }))
        .sort((a: any, b: any) => a.raw.localeCompare(b.raw));
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
                                <div
                                    class="flex flex-col items-center md:items-start min-w-[120px]"
                                >
                                    <span
                                        class="text-3xl font-bold text-primary font-serif"
                                        >{item.time}</span
                                    >
                                    <span
                                        class="text-sm opacity-70 uppercase tracking-wider"
                                        >{item.date}</span
                                    >
                                </div>
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
