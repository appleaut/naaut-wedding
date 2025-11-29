<script lang="ts">
    import { config, language, type WeddingConfig } from "../lib/store";
    import { translations } from "../lib/translations";
    import { push } from "svelte-spa-router";
    import { db, auth } from "../lib/firebase";
    import {
        collection,
        getDocs,
        doc,
        setDoc,
        getDoc,
        deleteDoc,
        query,
        orderBy,
    } from "firebase/firestore";
    import { onMount } from "svelte";
    import { onAuthStateChanged } from "firebase/auth";
    import flatpickr from "flatpickr";
    import "flatpickr/dist/flatpickr.css";

    function toggleLanguage() {
        $language = $language === "th" ? "en" : "th";
    }

    async function fetchConfig() {
        try {
            const docRef = doc(db, "config", "main");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();

                // Helper to format date for text input (DD/MM/YYYY HH:mm)
                const formatDate = (dateStr: string) => {
                    if (!dateStr) return "";
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return dateStr;
                    const pad = (n: number) => n.toString().padStart(2, "0");
                    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                };

                if (data.weddingDate)
                    data.weddingDate = formatDate(data.weddingDate);
                if (data.qrCodeStartTime)
                    data.qrCodeStartTime = formatDate(data.qrCodeStartTime);
                if (data.qrCodeEndTime)
                    data.qrCodeEndTime = formatDate(data.qrCodeEndTime);

                // Format times in schedule
                if (data.schedule && Array.isArray(data.schedule)) {
                    data.schedule = data.schedule.map((item: any) => ({
                        ...item,
                        time: formatDate(item.time),
                    }));
                }

                if (!data.sectionOrder) {
                    data.sectionOrder = [
                        "Countdown",
                        "EventDetails",
                        "Schedule",
                        "Map",
                        "Gallery",
                        "Video",
                        "QRCode",
                        "RSVP",
                        "Guestbook",
                    ];
                }

                if (data.showEventDetails === undefined) {
                    data.showEventDetails = true;
                }

                config.set(data as any);
            }
        } catch (e) {
            console.error("Error loading config:", e);
        }
    }

    async function refreshData() {
        await fetchConfig();
        await fetchRSVPs();
        await fetchGuestbook();
    }

    onMount(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                push("/login");
            }
        });

        fetchConfig().then(() => {
            fetchRSVPs();
            fetchGuestbook();
        });

        return unsubscribe;
    });

    let activeTab = "config"; // config, rsvp, guestbook

    try {
        if (typeof localStorage !== "undefined") {
            const saved = localStorage.getItem("adminActiveTab");
            if (saved) activeTab = saved;
        }
    } catch (e) {}

    $: if (typeof localStorage !== "undefined") {
        localStorage.setItem("adminActiveTab", activeTab);
    }

    let rsvps: any[] = [];

    async function fetchRSVPs() {
        try {
            const querySnapshot = await getDocs(collection(db, "rsvp"));
            rsvps = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (e) {
            console.error("Error fetching RSVPs:", e);
        }
    }

    let wishes: any[] = [];

    async function fetchGuestbook() {
        try {
            const q = query(
                collection(db, "guestbook"),
                orderBy("timestamp", "desc"),
            );
            const querySnapshot = await getDocs(q);
            wishes = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate
                        ? data.timestamp.toDate()
                        : new Date(data.timestamp) || new Date(),
                };
            });
        } catch (e) {
            console.error("Error fetching Guestbook:", e);
        }
    }

    function logout() {
        push("/login");
    }

    async function saveConfig() {
        try {
            const configToSave = { ...$config };
            // Convert local date strings (DD/MM/YYYY HH:mm) back to ISO strings for storage
            const toISO = (dateStr: string) => {
                if (!dateStr) return "";

                // Try parsing DD/MM/YYYY HH:mm
                const parts = dateStr.match(
                    /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{1,2})$/,
                );
                if (parts) {
                    const [_, day, month, year, hour, minute] = parts;
                    const d = new Date(
                        parseInt(year),
                        parseInt(month) - 1,
                        parseInt(day),
                        parseInt(hour),
                        parseInt(minute),
                    );
                    return isNaN(d.getTime()) ? dateStr : d.toISOString();
                }

                const d = new Date(dateStr);
                return isNaN(d.getTime()) ? dateStr : d.toISOString();
            };

            if (configToSave.weddingDate)
                configToSave.weddingDate = toISO(configToSave.weddingDate);
            if (configToSave.qrCodeStartTime)
                configToSave.qrCodeStartTime = toISO(
                    configToSave.qrCodeStartTime,
                );
            if (configToSave.qrCodeEndTime)
                configToSave.qrCodeEndTime = toISO(configToSave.qrCodeEndTime);

            if (configToSave.schedule && Array.isArray(configToSave.schedule)) {
                configToSave.schedule = configToSave.schedule.map(
                    (item: any) => ({
                        ...item,
                        time: toISO(item.time),
                    }),
                );
            }

            await setDoc(doc(db, "config", "main"), configToSave);
            modalMessage = translations[$language].config_saved;
            modalType = "success";
            showModal = true;
        } catch (e: any) {
            console.error("Error saving config:", e);
            modalMessage = `${translations[$language].config_save_error} ${e.message}`;
            modalType = "error";
            showModal = true;
        }
    }

    async function deleteWish(id: string) {
        if (!confirm(translations[$language].delete_confirm)) return;
        try {
            await deleteDoc(doc(db, "guestbook", id));
            await fetchGuestbook();
        } catch (e) {
            console.error("Error deleting wish:", e);
            alert(translations[$language].delete_error);
        }
    }

    async function testConnection() {
        try {
            const querySnapshot = await getDocs(collection(db, "config"));
            modalMessage = `${translations[$language].connection_success} ${querySnapshot.size}`;
            modalType = "success";
            showModal = true;
        } catch (e: any) {
            console.error("Connection failed", e);
            modalMessage = `${translations[$language].connection_failed} ${e.message}`;
            modalType = "error";
            showModal = true;
        }
    }

    let showModal = false;
    let modalMessage = "";
    let modalType = "success";

    function closeModal() {
        showModal = false;
    }

    function datePicker(node: HTMLInputElement, value: string) {
        const fp = flatpickr(node, {
            enableTime: true,
            dateFormat: "d/m/Y H:i",
            time_24hr: true,
            allowInput: true,
            defaultDate: value,
            onChange: (selectedDates, dateStr) => {
                node.value = dateStr;
                node.dispatchEvent(new Event("input"));
            },
        });

        return {
            update(newValue: string) {
                if (newValue) {
                    fp.setDate(newValue, false, "d/m/Y H:i");
                }
            },
            destroy() {
                fp.destroy();
            },
        };
    }
    function timePicker(node: HTMLInputElement, value: string) {
        const fp = flatpickr(node, {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            allowInput: true,
            defaultDate: value,
            onChange: (selectedDates, dateStr) => {
                node.value = dateStr;
                node.dispatchEvent(new Event("input"));
            },
        });

        return {
            update(newValue: string) {
                if (newValue) {
                    fp.setDate(newValue, false, "H:i");
                }
            },
            destroy() {
                fp.destroy();
            },
        };
    }
    function moveSection(index: number, direction: "up" | "down") {
        const newOrder = [...$config.sectionOrder];
        if (direction === "up") {
            if (index > 0) {
                [newOrder[index - 1], newOrder[index]] = [
                    newOrder[index],
                    newOrder[index - 1],
                ];
            }
        } else {
            if (index < newOrder.length - 1) {
                [newOrder[index + 1], newOrder[index]] = [
                    newOrder[index],
                    newOrder[index + 1],
                ];
            }
        }
        $config.sectionOrder = newOrder;
    }

    function addScheduleItem() {
        if (!$config.schedule) $config.schedule = [];
        $config.schedule = [...$config.schedule, { time: "", title: "" }];
    }

    function removeScheduleItem(index: number) {
        $config.schedule = $config.schedule.filter((_, i) => i !== index);
    }

    const sectionConfigMap: Record<string, keyof WeddingConfig> = {
        Countdown: "showCountdown",
        EventDetails: "showEventDetails",
        Schedule: "showSchedule",
        Map: "showMap",
        Gallery: "showGallery",
        Video: "showVideo",
        QRCode: "showQRCode",
        RSVP: "showRSVP",
        Guestbook: "showGuestbook",
    };
</script>

<div class="drawer lg:drawer-open">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col p-4">
        <!-- Page content here -->
        <div class="navbar bg-base-100 mb-4 shadow rounded-box">
            <div class="flex-1">
                <label
                    for="my-drawer-2"
                    class="btn btn-square btn-ghost lg:hidden"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        class="inline-block w-5 h-5 stroke-current"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        ></path></svg
                    >
                </label>
                <button class="btn btn-ghost text-xl" on:click={refreshData}
                    >{translations[$language].refresh}</button
                >
            </div>
            <div class="flex-none gap-2">
                <button class="btn btn-ghost" on:click={toggleLanguage}>
                    <span
                        class:font-bold={$language === "th"}
                        class:text-primary={$language === "th"}>TH</span
                    >
                    <span class="mx-1">|</span>
                    <span
                        class:font-bold={$language === "en"}
                        class:text-primary={$language === "en"}>EN</span
                    >
                </button>
                <button class="btn btn-ghost" on:click={logout}
                    >{translations[$language].logout}</button
                >
            </div>
        </div>

        {#if activeTab === "config"}
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">
                        {translations[$language].website_config}
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label" for="groomName"
                                ><span class="label-text"
                                    >{translations[$language].groom_name}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="groomName"
                                bind:value={$config.groomName}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="groomNickname"
                                ><span class="label-text"
                                    >{translations[$language]
                                        .groom_nickname}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="groomNickname"
                                bind:value={$config.groomNickname}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="brideName"
                                ><span class="label-text"
                                    >{translations[$language].bride_name}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="brideName"
                                bind:value={$config.brideName}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="brideNickname"
                                ><span class="label-text"
                                    >{translations[$language]
                                        .bride_nickname}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="brideNickname"
                                bind:value={$config.brideNickname}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="weddingDate"
                                ><span class="label-text"
                                    >{translations[$language]
                                        .wedding_date}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="weddingDate"
                                bind:value={$config.weddingDate}
                                use:datePicker={$config.weddingDate}
                                class="input input-bordered"
                                placeholder="DD/MM/YYYY HH:mm"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="weddingLocation"
                                ><span class="label-text"
                                    >{translations[$language].location}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="weddingLocation"
                                bind:value={$config.weddingLocation}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="themeColor"
                                ><span class="label-text"
                                    >{translations[$language].theme}</span
                                ></label
                            >
                            <select
                                id="themeColor"
                                bind:value={$config.themeColor}
                                class="select select-bordered"
                            >
                                <option value="valentine"
                                    >{translations[$language]
                                        .theme_valentine}</option
                                >
                                <option value="luxury"
                                    >{translations[$language]
                                        .theme_luxury}</option
                                >
                                <option value="garden"
                                    >{translations[$language]
                                        .theme_garden}</option
                                >
                            </select>
                        </div>
                        <div class="form-control">
                            <label class="label" for="videoUrl"
                                ><span class="label-text"
                                    >{translations[$language].video_url}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="videoUrl"
                                bind:value={$config.videoUrl}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control md:col-span-2">
                            <label class="label" for="description"
                                ><span class="label-text"
                                    >{translations[$language].description}</span
                                ></label
                            >
                            <textarea
                                id="description"
                                bind:value={$config.description}
                                class="textarea textarea-bordered h-24"
                            ></textarea>
                        </div>
                    </div>

                    <div class="divider">
                        {translations[$language].qr_code_settings}
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label" for="qrCodeStartTime"
                                ><span class="label-text"
                                    >{translations[$language]
                                        .qr_code_start}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="qrCodeStartTime"
                                bind:value={$config.qrCodeStartTime}
                                use:datePicker={$config.qrCodeStartTime}
                                class="input input-bordered"
                                placeholder="DD/MM/YYYY HH:mm"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="qrCodeEndTime"
                                ><span class="label-text"
                                    >{translations[$language].qr_code_end}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="qrCodeEndTime"
                                bind:value={$config.qrCodeEndTime}
                                use:datePicker={$config.qrCodeEndTime}
                                class="input input-bordered"
                                placeholder="DD/MM/YYYY HH:mm"
                            />
                        </div>
                    </div>

                    <div class="divider">
                        {translations[$language].schedule_settings}
                    </div>

                    <div class="space-y-4">
                        {#if $config.schedule}
                            {#each $config.schedule as item, i}
                                <div class="card bg-base-200 p-4">
                                    <div
                                        class="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        <div class="form-control">
                                            <label
                                                class="label"
                                                for="schedule-time-{i}"
                                            >
                                                <span class="label-text"
                                                    >{translations[$language]
                                                        .event_time}</span
                                                >
                                            </label>
                                            <input
                                                type="text"
                                                id="schedule-time-{i}"
                                                bind:value={item.time}
                                                use:datePicker={item.time}
                                                class="input input-bordered"
                                                placeholder="DD/MM/YYYY HH:mm"
                                            />
                                        </div>
                                        <div class="form-control">
                                            <label
                                                class="label"
                                                for="schedule-title-{i}"
                                            >
                                                <span class="label-text"
                                                    >{translations[$language]
                                                        .event_title}</span
                                                >
                                            </label>
                                            <div class="flex gap-2">
                                                <input
                                                    type="text"
                                                    id="schedule-title-{i}"
                                                    bind:value={item.title}
                                                    class="input input-bordered flex-1"
                                                />
                                                <button
                                                    class="btn btn-error btn-square"
                                                    on:click={() =>
                                                        removeScheduleItem(i)}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        class="h-6 w-6"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        ><path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        /></svg
                                                    >
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        {/if}

                        <button
                            class="btn btn-primary w-full"
                            on:click={addScheduleItem}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 4v16m8-8H4"
                                /></svg
                            >
                            {translations[$language].add_schedule_item}
                        </button>
                    </div>

                    <div class="divider">
                        {translations[$language].bank_account}
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-control">
                            <label class="label" for="bankName"
                                ><span class="label-text"
                                    >{translations[$language].bank}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="bankName"
                                bind:value={$config.bankAccount.bankName}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="accountName"
                                ><span class="label-text"
                                    >{translations[$language]
                                        .account_name}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="accountName"
                                bind:value={$config.bankAccount.accountName}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="accountNumber"
                                ><span class="label-text"
                                    >{translations[$language]
                                        .account_number}</span
                                ></label
                            >
                            <input
                                type="text"
                                id="accountNumber"
                                bind:value={$config.bankAccount.accountNumber}
                                class="input input-bordered"
                            />
                        </div>
                    </div>

                    <div class="divider">
                        {translations[$language].section_order}
                    </div>
                    <div class="card bg-base-100 border">
                        <div class="card-body p-4">
                            {#if $config.sectionOrder}
                                {#each $config.sectionOrder as section, index}
                                    <div
                                        class="flex items-center justify-between p-2 bg-base-200 rounded mb-2"
                                    >
                                        <div class="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                class="toggle toggle-primary toggle-sm"
                                                bind:checked={
                                                    $config[
                                                        sectionConfigMap[
                                                            section
                                                        ]
                                                    ]
                                                }
                                            />
                                            <span class="font-medium"
                                                >{section}</span
                                            >
                                        </div>
                                        <div class="flex gap-2">
                                            <button
                                                class="btn btn-sm btn-square btn-ghost"
                                                disabled={index === 0}
                                                on:click={() =>
                                                    moveSection(index, "up")}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke-width="1.5"
                                                    stroke="currentColor"
                                                    class="w-5 h-5"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        d="M4.5 15.75l7.5-7.5 7.5 7.5"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                class="btn btn-sm btn-square btn-ghost"
                                                disabled={index ===
                                                    $config.sectionOrder
                                                        .length -
                                                        1}
                                                on:click={() =>
                                                    moveSection(index, "down")}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke-width="1.5"
                                                    stroke="currentColor"
                                                    class="w-5 h-5"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    </div>

                    <div class="card-actions justify-end mt-4">
                        <button class="btn btn-primary" on:click={saveConfig}
                            >{translations[$language].save_changes}</button
                        >
                    </div>
                </div>
            </div>
        {:else if activeTab === "rsvp"}
            <!-- Desktop View -->
            <div
                class="hidden md:block overflow-x-auto bg-base-100 shadow-xl rounded-box"
            >
                <table class="table">
                    <thead>
                        <tr>
                            <th>{translations[$language].name}</th>
                            <th>{translations[$language].status}</th>
                            <th>{translations[$language].attendees}</th>
                            <th>{translations[$language].message}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each rsvps as rsvp}
                            <tr>
                                <td>{rsvp.name}</td>
                                <td class="whitespace-nowrap">
                                    {#if rsvp.status === "attending"}
                                        <div class="badge badge-success">
                                            {translations[$language].attending}
                                        </div>
                                    {:else if rsvp.status === "not-sure"}
                                        <div class="badge badge-warning">
                                            {translations[$language].not_sure}
                                        </div>
                                    {:else}
                                        <div class="badge badge-error">
                                            {translations[$language]
                                                .not_attending}
                                        </div>
                                    {/if}
                                </td>
                                <td>{rsvp.attendees}</td>
                                <td>{rsvp.message}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Mobile View -->
            <div class="grid grid-cols-1 gap-4 md:hidden">
                {#each rsvps as rsvp}
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body p-4">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-bold text-lg">{rsvp.name}</h3>
                                {#if rsvp.status === "attending"}
                                    <div
                                        class="badge badge-success whitespace-nowrap"
                                    >
                                        {translations[$language].attending}
                                    </div>
                                {:else if rsvp.status === "not-sure"}
                                    <div
                                        class="badge badge-warning whitespace-nowrap"
                                    >
                                        {translations[$language].not_sure}
                                    </div>
                                {:else}
                                    <div
                                        class="badge badge-error whitespace-nowrap"
                                    >
                                        {translations[$language].not_attending}
                                    </div>
                                {/if}
                            </div>

                            <div
                                class="flex justify-between items-center py-2 border-b border-base-200"
                            >
                                <span class="opacity-70"
                                    >{translations[$language].attendees}</span
                                >
                                <span class="font-medium">{rsvp.attendees}</span
                                >
                            </div>

                            {#if rsvp.message}
                                <div class="mt-3">
                                    <span class="opacity-70 text-sm block mb-1"
                                        >{translations[$language].message}</span
                                    >
                                    <div
                                        class="bg-base-200 p-3 rounded-lg text-sm"
                                    >
                                        {rsvp.message}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        {:else if activeTab === "guestbook"}
            <div class="grid gap-4">
                {#each wishes as wish}
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-bold">{wish.name}</h3>
                                    <p>{wish.message}</p>
                                    <p class="text-xs opacity-50">
                                        {wish.timestamp.toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    class="btn btn-square btn-sm btn-error"
                                    on:click={() => deleteWish(wish.id)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        /></svg
                                    >
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    <div class="drawer-side">
        <label
            for="my-drawer-2"
            aria-label="close sidebar"
            class="drawer-overlay"
        ></label>
        <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <!-- Sidebar content here -->
            <li class="mb-4 text-xl font-bold px-4">
                {translations[$language].admin_panel}
            </li>
            <li>
                <button
                    class:active={activeTab === "config"}
                    on:click={() => (activeTab = "config")}
                    >{translations[$language].configuration}</button
                >
            </li>
            <li>
                <button
                    class:active={activeTab === "rsvp"}
                    on:click={() => (activeTab = "rsvp")}
                    >{translations[$language].rsvp_list}</button
                >
            </li>
            <li>
                <button
                    class:active={activeTab === "guestbook"}
                    on:click={() => (activeTab = "guestbook")}
                    >{translations[$language].guestbook}</button
                >
            </li>
            <div class="divider"></div>
            <li>
                <button on:click={testConnection}
                    >{translations[$language].test_connection}</button
                >
            </li>
            <li>
                <a href="/" target="_blank"
                    >{translations[$language].view_site}</a
                >
            </li>
        </ul>
    </div>
</div>

{#if showModal}
    <dialog class="modal modal-open">
        <div class="modal-box">
            <h3
                class="font-bold text-lg"
                class:text-success={modalType === "success"}
                class:text-error={modalType === "error"}
            >
                {modalType === "success"
                    ? translations[$language].success
                    : translations[$language].error}
            </h3>
            <p class="py-4">{modalMessage}</p>
            <div class="modal-action">
                <button class="btn" on:click={closeModal}
                    >{translations[$language].close}</button
                >
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button on:click={closeModal}>close</button>
        </form>
    </dialog>
{/if}
