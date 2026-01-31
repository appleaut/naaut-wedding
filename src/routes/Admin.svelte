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
    import {
        ref,
        uploadBytes,
        getDownloadURL,
        deleteObject,
    } from "firebase/storage";
    import { storage } from "../lib/firebase";
    import { onMount } from "svelte";
    import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
    import flatpickr from "flatpickr";
    import "flatpickr/dist/flatpickr.css";

    function toggleLanguage() {
        $language = $language === "th" ? "en" : "th";
    }

    let originalConfig = "";
    $: hasUnsavedChanges =
        activeTab === "config" &&
        originalConfig !== "" &&
        JSON.stringify($config) !== originalConfig;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
        if (hasUnsavedChanges) {
            event.preventDefault();
            event.returnValue = "";
            return "";
        }
    }

    let showConfirmModal = false;
    let onConfirm: () => void = () => {};

    function triggerConfirm(callback: () => void) {
        if (hasUnsavedChanges) {
            onConfirm = callback;
            showConfirmModal = true;
        } else {
            callback();
        }
    }

    function handleConfirmAction() {
        if (originalConfig) {
            try {
                config.set(JSON.parse(originalConfig));
            } catch (e) {
                console.error("Failed to revert config", e);
            }
        }
        showConfirmModal = false;
        onConfirm();
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

                if (!data.customColors || !Array.isArray(data.customColors)) {
                    data.customColors = [
                        "#570df8",
                        "#f000b8",
                        "#37cdbe",
                        "#3d4451",
                        "#ffffff",
                    ];
                }
                while (data.customColors.length < 5) {
                    data.customColors.push("#000000");
                }

                if (
                    !data.dressCodeColors ||
                    !Array.isArray(data.dressCodeColors)
                ) {
                    data.dressCodeColors = ["#ffffff"];
                }

                if (data.sectionOrder) {
                    data.sectionOrder = data.sectionOrder.filter(
                        (section: string) => section !== "CoupleProfile",
                    );
                }

                config.set(data as any);
                originalConfig = JSON.stringify(data);
            }
        } catch (e) {
            console.error("Error loading config:", e);
        }
    }

    let showToast = false;
    let toastMessage = "";

    function showToastNotification(message: string) {
        toastMessage = message;
        showToast = true;
        setTimeout(() => {
            showToast = false;
        }, 3000);
    }

    async function refreshData() {
        triggerConfirm(async () => {
            await fetchConfig();
            await fetchRSVPs();
            await fetchGuestbook();
            showToastNotification(translations[$language].refresh_success);
        });
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

    let activeTab = "config"; // config, rsvp, guestbook, change-password, gallery
    let drawerOpen = false;

    let newPassword = "";
    let confirmNewPassword = "";

    function switchTab(tab: string) {
        triggerConfirm(() => {
            activeTab = tab;
            if (tab === "change-password") {
                newPassword = "";
                confirmNewPassword = "";
            }
            drawerOpen = false;
        });
    }

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

    $: totalResponses = rsvps.length;
    $: attendingCount = rsvps.filter((r) => r.status === "attending").length;
    $: notSureCount = rsvps.filter((r) => r.status === "not-sure").length;
    $: notAttendingCount = rsvps.filter(
        (r) => r.status !== "attending" && r.status !== "not-sure",
    ).length;
    $: totalGuests = rsvps.reduce((sum, r) => {
        const count = parseInt(r.attendees);
        return sum + (isNaN(count) ? 0 : count);
    }, 0);

    function exportToExcel() {
        const headers = [
            translations[$language].name,
            translations[$language].status,
            translations[$language].attendees,
            translations[$language].message,
        ];

        const rows = rsvps.map((r) => {
            let statusText = "";
            if (r.status === "attending")
                statusText = translations[$language].attending;
            else if (r.status === "not-sure")
                statusText = translations[$language].not_sure;
            else statusText = translations[$language].not_attending;

            // Escape quotes and wrap in quotes for CSV safety
            const escape = (text: string) => {
                if (!text) return "";
                return `"${text.toString().replace(/"/g, '""')}"`;
            };

            return [
                escape(r.name),
                escape(statusText),
                r.attendees || 0,
                escape(r.message),
            ].join(",");
        });

        const bomber = "\uFEFF"; // Byte Order Mark for UTF-8 to display Thai correctly in Excel
        const csvContent = bomber + headers.join(",") + "\n" + rows.join("\n");
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `rsvp_list_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        triggerConfirm(async () => {
            try {
                await signOut(auth);
            } catch (e) {
                console.error("Logout error:", e);
            }
        });
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
            originalConfig = JSON.stringify($config);
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

    async function handleChangePassword() {
        if (!auth.currentUser) return;
        if (newPassword !== confirmNewPassword) {
            modalMessage = translations[$language].password_mismatch;
            modalType = "error";
            showModal = true;
            return;
        }
        try {
            await updatePassword(auth.currentUser, newPassword);
            modalMessage = translations[$language].password_updated;
            modalType = "success";
            showModal = true;
            newPassword = "";
            confirmNewPassword = "";
        } catch (e: any) {
            console.error("Error updating password:", e);
            modalMessage = `${translations[$language].update_error}: ${e.message}`;
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

    function addDressCodeColor() {
        if (!$config.dressCodeColors) $config.dressCodeColors = [];
        if ($config.dressCodeColors.length < 6) {
            $config.dressCodeColors = [...$config.dressCodeColors, "#ffffff"];
        }
    }

    function removeDressCodeColor(index: number) {
        $config.dressCodeColors = $config.dressCodeColors.filter(
            (_, i) => i !== index,
        );
    }

    const sectionConfigMap: Record<
        string,
        | "showCountdown"
        | "showEventDetails"
        | "showSchedule"
        | "showMap"
        | "showGallery"
        | "showVideo"
        | "showQRCode"
        | "showRSVP"
        | "showGuestbook"
    > = {
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

    let uploading = false;

    function resizeImage(file: File, maxWidth: number): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        canvas.toBlob(
                            (blob) => {
                                if (blob) resolve(blob);
                                else reject(new Error("Canvas to Blob failed"));
                            },
                            file.type,
                            0.8,
                        );
                    } else {
                        reject(new Error("Canvas context failed"));
                    }
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function uploadImage(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        const timestamp = Date.now();
        const extension = file.name.split(".").pop();
        const randomId = Math.random().toString(36).substring(2, 9);
        const newFileName = `${timestamp}_${randomId}.${extension}`;

        uploading = true;
        try {
            // Resize for thumbnail
            const smallBlob = await resizeImage(file, 600);

            const largeRef = ref(storage, `image/gallery/large_${newFileName}`);
            const smallRef = ref(storage, `image/gallery/small_${newFileName}`);

            // Upload both
            const [largeSnapshot, smallSnapshot] = await Promise.all([
                uploadBytes(largeRef, file),
                uploadBytes(smallRef, smallBlob),
            ]);

            const largeUrl = await getDownloadURL(largeSnapshot.ref);
            const smallUrl = await getDownloadURL(smallSnapshot.ref);

            if (!$config.galleryImages) $config.galleryImages = [];
            $config.galleryImages = [
                ...$config.galleryImages,
                { small: smallUrl, large: largeUrl }, // New Object Structure
            ];

            await saveConfig();
            showToastNotification(translations[$language].upload_success);
            input.value = ""; // Reset input
        } catch (e) {
            console.error("Upload failed:", e);
            modalMessage = translations[$language].upload_error;
            modalType = "error";
            showModal = true;
        } finally {
            uploading = false;
        }
    }

    async function deleteImage(img: string | { small: string; large: string }) {
        if (!confirm(translations[$language].delete_image_confirm)) return;

        try {
            if (typeof img === "string") {
                const imageRef = ref(storage, img);
                try {
                    await deleteObject(imageRef);
                } catch (e: any) {
                    if (e.code !== "storage/object-not-found") throw e;
                }
            } else {
                const smallRef = ref(storage, img.small);
                const largeRef = ref(storage, img.large);
                await Promise.all([
                    deleteObject(smallRef).catch((e) => {
                        if (e.code !== "storage/object-not-found") throw e;
                    }),
                    deleteObject(largeRef).catch((e) => {
                        if (e.code !== "storage/object-not-found") throw e;
                    }),
                ]);
            }

            // Update config
            $config.galleryImages = $config.galleryImages.filter(
                (item) => item !== img,
            );
            await saveConfig();

            showToastNotification(translations[$language].delete_image_success);
        } catch (e) {
            console.error("Delete failed:", e);
            modalMessage = translations[$language].delete_image_error;
            modalType = "error";
            showModal = true;
        }
    }

    let editingRSVP: any = null;
    let showRSVPModal = false;

    function openEditRSVP(rsvp: any) {
        editingRSVP = { ...rsvp };
        showRSVPModal = true;
    }

    function closeRSVPModal() {
        showRSVPModal = false;
        editingRSVP = null;
    }

    async function saveRSVP() {
        if (!editingRSVP) return;
        try {
            await setDoc(doc(db, "rsvp", editingRSVP.id), editingRSVP);
            await fetchRSVPs();
            showToastNotification(translations[$language].rsvp_update_success);
            closeRSVPModal();
        } catch (e: any) {
            console.error("Error saving RSVP:", e);
            modalMessage = translations[$language].rsvp_update_error;
            modalType = "error";
            showModal = true;
        }
    }

    async function deleteRSVP(id: string) {
        rsvpToDelete = id;
        showRSVPDeleteModal = true;
    }

    let rsvpToDelete: string | null = null;
    let showRSVPDeleteModal = false;

    async function confirmDeleteRSVP() {
        if (!rsvpToDelete) return;
        try {
            await deleteDoc(doc(db, "rsvp", rsvpToDelete));
            await fetchRSVPs();
            showToastNotification(translations[$language].rsvp_delete_success);
        } catch (e) {
            console.error("Error deleting RSVP:", e);
            modalMessage = translations[$language].rsvp_delete_error;
            modalType = "error";
            showModal = true;
        } finally {
            showRSVPDeleteModal = false;
            rsvpToDelete = null;
        }
    }
</script>

<svelte:window on:beforeunload={handleBeforeUnload} />

<div class="drawer lg:drawer-open" data-theme="valentine">
    <input
        id="my-drawer-2"
        type="checkbox"
        class="drawer-toggle"
        bind:checked={drawerOpen}
    />
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
                            <div class="label">
                                <span class="label-text">
                                    {translations[$language].groom_name}
                                </span>
                            </div>
                            <input
                                type="text"
                                aria-label={translations[$language].groom_name}
                                bind:value={$config.groomName}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <div class="label">
                                <span class="label-text">
                                    {translations[$language].groom_nickname}
                                </span>
                            </div>
                            <input
                                type="text"
                                aria-label={translations[$language]
                                    .groom_nickname}
                                bind:value={$config.groomNickname}
                                class="input input-bordered"
                            />
                        </div>

                        <div class="form-control">
                            <div class="label">
                                <span class="label-text">
                                    {translations[$language].bride_name}
                                </span>
                            </div>
                            <input
                                type="text"
                                aria-label={translations[$language].bride_name}
                                bind:value={$config.brideName}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <div class="label">
                                <span class="label-text">
                                    {translations[$language].bride_nickname}
                                </span>
                            </div>
                            <input
                                type="text"
                                aria-label={translations[$language]
                                    .bride_nickname}
                                bind:value={$config.brideNickname}
                                class="input input-bordered"
                            />
                        </div>

                        <div class="form-control">
                            <div class="label">
                                <span class="label-text">
                                    {translations[$language].wedding_date}
                                </span>
                            </div>
                            <input
                                type="text"
                                aria-label={translations[$language]
                                    .wedding_date}
                                bind:value={$config.weddingDate}
                                use:datePicker={$config.weddingDate}
                                class="input input-bordered"
                                placeholder="DD/MM/YYYY HH:mm"
                            />
                        </div>
                        <div class="form-control">
                            <div class="label">
                                <span class="label-text">
                                    {translations[$language].location}
                                </span>
                            </div>
                            <input
                                type="text"
                                aria-label={translations[$language].location}
                                bind:value={$config.weddingLocation}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <div class="label">
                                <span class="label-text">
                                    {translations[$language].theme}
                                </span>
                            </div>
                            <select
                                aria-label={translations[$language].theme}
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
                                <option value="custom"
                                    >{translations[$language]
                                        .theme_custom}</option
                                >
                            </select>
                        </div>

                        {#if $config.themeColor === "custom"}
                            <div
                                class="form-control md:col-span-2 bg-base-200 p-4 rounded-box"
                            >
                                <div class="label pt-0">
                                    <span class="label-text font-bold"
                                        >{translations[$language]
                                            .custom_colors}</span
                                    >
                                </div>
                                <div
                                    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4"
                                >
                                    {#each [0, 1, 2, 3, 4] as i}
                                        <div class="form-control">
                                            <div
                                                class="label-text text-xs mb-1"
                                            >
                                                {i === 0
                                                    ? translations[$language]
                                                          .color_primary
                                                    : i === 1
                                                      ? translations[$language]
                                                            .color_secondary
                                                      : i === 2
                                                        ? translations[
                                                              $language
                                                          ].color_accent
                                                        : i === 3
                                                          ? translations[
                                                                $language
                                                            ].color_neutral
                                                          : translations[
                                                                $language
                                                            ].color_base}
                                            </div>
                                            <div class="flex gap-2">
                                                <input
                                                    type="color"
                                                    class="input input-bordered p-0 w-10 h-10 shrink-0 cursor-pointer rounded-full overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full"
                                                    bind:value={
                                                        $config.customColors[i]
                                                    }
                                                    aria-label="Color picker"
                                                />
                                                <input
                                                    type="text"
                                                    class="input input-bordered w-full text-sm px-2 min-w-0"
                                                    bind:value={
                                                        $config.customColors[i]
                                                    }
                                                    placeholder="#000000"
                                                    aria-label="Color hex code"
                                                />
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                                <div class="text-xs text-base-content/60 mt-2">
                                    Enter Hex codes (e.g. #0C143B) or use the
                                    color picker.
                                </div>
                            </div>
                        {/if}
                        <div class="form-control">
                            <div class="label">
                                <span class="label-text">
                                    {translations[$language].video_url}
                                </span>
                            </div>
                            <input
                                type="text"
                                aria-label={translations[$language].video_url}
                                bind:value={$config.videoUrl}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control md:col-span-2">
                            <div class="label">
                                <span class="label-text">
                                    {translations[$language].description}
                                </span>
                            </div>
                            <textarea
                                aria-label={translations[$language].description}
                                bind:value={$config.description}
                                class="textarea textarea-bordered h-24"
                            ></textarea>
                        </div>
                    </div>

                    <div class="divider">
                        {translations[$language].dress_code}
                    </div>
                    {#if $config.dressCodeColors}
                        <div class="form-control md:col-span-2">
                            <div class="label">
                                <span class="label-text"
                                    >{translations[$language]
                                        .dress_code_colors}</span
                                >
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {#each $config.dressCodeColors as _, i}
                                    <div class="form-control">
                                        <div class="flex gap-2">
                                            <input
                                                type="color"
                                                class="input input-bordered p-0 w-10 h-10 shrink-0 cursor-pointer rounded-full overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full"
                                                bind:value={
                                                    $config.dressCodeColors[i]
                                                }
                                                aria-label="Dress code color picker"
                                            />
                                            <input
                                                type="text"
                                                class="input input-bordered w-full text-sm px-2 min-w-0"
                                                bind:value={
                                                    $config.dressCodeColors[i]
                                                }
                                                placeholder="#ffffff"
                                                aria-label="Dress code color hex code"
                                            />
                                            <button
                                                class="btn btn-square btn-ghost btn-sm text-error"
                                                on:click={() =>
                                                    removeDressCodeColor(i)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="h-5 w-5"
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
                                {/each}
                                {#if $config.dressCodeColors.length < 6}
                                    <button
                                        class="btn btn-outline btn-sm h-10 border-dashed"
                                        on:click={addDressCodeColor}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-5 w-5"
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
                                    </button>
                                {/if}
                            </div>
                        </div>
                    {/if}

                    <div class="divider">
                        {translations[$language].qr_code_settings}
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control">
                            <div class="label">
                                <span class="label-text">
                                    {translations[$language].qr_code_start}
                                </span>
                            </div>
                            <input
                                type="text"
                                aria-label={translations[$language]
                                    .qr_code_start}
                                bind:value={$config.qrCodeStartTime}
                                use:datePicker={$config.qrCodeStartTime}
                                class="input input-bordered"
                                placeholder="DD/MM/YYYY HH:mm"
                            />
                        </div>
                        <div class="form-control">
                            <div class="label">
                                <span class="label-text">
                                    {translations[$language].qr_code_end}
                                </span>
                            </div>
                            <input
                                type="text"
                                aria-label={translations[$language].qr_code_end}
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
            <div
                class="flex flex-col lg:flex-row gap-4 mb-4 items-start lg:items-end justify-between"
            >
                <div class="stats shadow w-full lg:w-auto bg-base-100">
                    <div class="stat place-items-center">
                        <div class="stat-title">
                            {translations[$language].total_responses}
                        </div>
                        <div class="stat-value">{totalResponses}</div>
                        <div class="stat-desc">
                            {translations[$language].total_guests}: {totalGuests}
                        </div>
                    </div>
                    <div class="stat place-items-center">
                        <div class="stat-title text-success">
                            {translations[$language].attending}
                        </div>
                        <div class="stat-value text-success">
                            {attendingCount}
                        </div>
                    </div>
                    <div class="stat place-items-center">
                        <div class="stat-title text-warning">
                            {translations[$language].not_sure}
                        </div>
                        <div class="stat-value text-warning">{notSureCount}</div>
                    </div>
                    <div class="stat place-items-center">
                        <div class="stat-title text-error">
                            {translations[$language].not_attending}
                        </div>
                        <div class="stat-value text-error">
                            {notAttendingCount}
                        </div>
                    </div>
                </div>
                <button
                    class="btn btn-success text-white w-full lg:w-auto"
                    on:click={exportToExcel}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 mr-2"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                    </svg>
                    {translations[$language].export_excel}
                </button>
            </div>

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
                            <th>{translations[$language].actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each rsvps as rsvp}
                            <tr>
                                <td class="whitespace-nowrap">{rsvp.name}</td>
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
                                <td>
                                    <div class="flex gap-2">
                                        <button
                                            class="btn btn-sm btn-ghost text-primary"
                                            on:click={() => openEditRSVP(rsvp)}
                                        >
                                            {translations[$language].edit}
                                        </button>
                                        <button
                                            class="btn btn-sm btn-ghost text-error"
                                            on:click={() => deleteRSVP(rsvp.id)}
                                        >
                                            {translations[$language].delete}
                                        </button>
                                    </div>
                                </td>
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

                            <div class="divider my-2"></div>
                            <div class="flex justify-end gap-2">
                                <button
                                    class="btn btn-sm btn-ghost text-primary"
                                    on:click={() => openEditRSVP(rsvp)}
                                >
                                    {translations[$language].edit}
                                </button>
                                <button
                                    class="btn btn-sm btn-ghost text-error"
                                    on:click={() => deleteRSVP(rsvp.id)}
                                >
                                    {translations[$language].delete}
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else if activeTab === "guestbook"}
            <div class="grid gap-4">
                {#if wishes.length === 0}
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body text-center text-base-content/60 py-10">
                             {translations[$language].no_wishes_found}
                        </div>
                    </div>
                {/if}
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
        {:else if activeTab === "gallery"}
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">
                        {translations[$language].gallery_management}
                    </h2>

                    <div class="form-control w-full max-w-xs">
                        <label class="label" for="gallery-upload">
                            <span class="label-text"
                                >{translations[$language].upload_image}</span
                            >
                        </label>
                        <input
                            type="file"
                            id="gallery-upload"
                            class="file-input file-input-bordered w-full max-w-xs"
                            accept="image/*"
                            on:change={uploadImage}
                            disabled={uploading}
                        />
                        {#if uploading}
                            <div class="text-sm text-info mt-2">
                                {translations[$language].uploading}
                            </div>
                        {/if}
                    </div>

                    <div class="divider"></div>

                    <div
                        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                        {#if $config.galleryImages}
                            {#each $config.galleryImages as img}
                                <div class="relative group aspect-square">
                                    <img
                                        src={typeof img === "string"
                                            ? img
                                            : img.small}
                                        alt="Gallery"
                                        class="w-full h-full object-cover rounded-lg shadow-md"
                                    />
                                    <button
                                        class="btn btn-circle btn-error btn-sm absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        on:click={() => deleteImage(img)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-4 w-4"
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
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>
        {:else if activeTab === "change-password"}
            <div class="flex justify-center items-center min-h-[50vh]">
                <div class="card bg-base-100 shadow-xl w-full max-w-md">
                    <div class="card-body">
                        <div class="flex flex-col items-center mb-6">
                            <div class="avatar placeholder mb-4">
                                <div
                                    class="bg-neutral text-neutral-content rounded-full w-16"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="w-8 h-8"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h2 class="card-title text-2xl font-bold">
                                {translations[$language].change_password}
                            </h2>
                            <p class="text-base-content/60 text-sm mt-1">
                                {translations[$language].secure_account}
                            </p>
                        </div>

                        <div class="form-control w-full">
                            <label class="label" for="newPassword">
                                <span class="label-text font-medium"
                                    >{translations[$language]
                                        .new_password}</span
                                >
                            </label>
                            <div class="relative">
                                <input
                                    type="password"
                                    id="newPassword"
                                    bind:value={newPassword}
                                    class="input input-bordered w-full pr-10"
                                    placeholder="••••••••"
                                />
                                <div
                                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-base-content/40"
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
                                            d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="form-control w-full mt-4">
                            <label class="label" for="confirmPassword">
                                <span class="label-text font-medium"
                                    >{translations[$language]
                                        .confirm_password}</span
                                >
                            </label>
                            <div class="relative">
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    bind:value={confirmNewPassword}
                                    class="input input-bordered w-full pr-10"
                                    placeholder="••••••••"
                                />
                                <div
                                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-base-content/40"
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
                                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="card-actions justify-end mt-8">
                            <button
                                class="btn btn-primary w-full"
                                on:click={handleChangePassword}
                                disabled={!newPassword ||
                                    !confirmNewPassword ||
                                    newPassword !== confirmNewPassword}
                            >
                                {#if newPassword && confirmNewPassword && newPassword === confirmNewPassword}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="w-5 h-5 mr-2"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M4.5 12.75l6 6 9-13.5"
                                        />
                                    </svg>
                                {/if}
                                {translations[$language].update_password}
                            </button>
                        </div>
                    </div>
                </div>
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
                    on:click={() => switchTab("config")}
                    >{translations[$language].configuration}</button
                >
            </li>
            <li>
                <button
                    class:active={activeTab === "rsvp"}
                    on:click={() => switchTab("rsvp")}
                    >{translations[$language].rsvp_list}</button
                >
            </li>
            <li>
                <button
                    class:active={activeTab === "guestbook"}
                    on:click={() => switchTab("guestbook")}
                    >{translations[$language].guestbook}</button
                >
            </li>
            <li>
                <button
                    class:active={activeTab === "gallery"}
                    on:click={() => switchTab("gallery")}
                    >{translations[$language].gallery_management}</button
                >
            </li>
            <div class="divider"></div>

            <li>
                <button
                    class:active={activeTab === "change-password"}
                    on:click={() => switchTab("change-password")}
                    >{translations[$language].change_password}</button
                >
            </li>
            <div class="divider"></div>
            <!-- <li>
                <button on:click={testConnection}
                    >{translations[$language].test_connection}</button
                >
            </li> -->
            <li>
                <a
                    href="/"
                    target="_blank"
                    on:click={() => (drawerOpen = false)}
                    >{translations[$language].view_site}</a
                >
            </li>
        </ul>
    </div>
</div>

{#if showModal}
    <dialog class="modal modal-open" data-theme="valentine">
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

{#if showConfirmModal}
    <dialog class="modal modal-open" data-theme="valentine">
        <div class="modal-box">
            <h3 class="font-bold text-lg text-warning">
                {translations[$language].unsaved_changes_confirm}
            </h3>
            <div class="modal-action">
                <button class="btn" on:click={() => (showConfirmModal = false)}>
                    {translations[$language].cancel}
                </button>
                <button class="btn btn-primary" on:click={handleConfirmAction}>
                    {translations[$language].confirm}
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button on:click={() => (showConfirmModal = false)}>close</button>
        </form>
    </dialog>
{/if}

{#if showRSVPModal && editingRSVP}
    <dialog class="modal modal-open" data-theme="valentine">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">
                {translations[$language].edit} RSVP
            </h3>
            
            <div class="form-control w-full mb-2">
                <label class="label" for="rsvp-name">
                    <span class="label-text">{translations[$language].name}</span>
                </label>
                <input
                    type="text"
                    id="rsvp-name"
                    bind:value={editingRSVP.name}
                    class="input input-bordered w-full"
                />
            </div>

            <div class="form-control w-full mb-2">
                <label class="label" for="rsvp-status">
                     <span class="label-text">{translations[$language].status}</span>
                </label>
                <select
                    id="rsvp-status"
                    class="select select-bordered w-full"
                    bind:value={editingRSVP.status}
                >
                    <option value="attending">{translations[$language].attending}</option>
                    <option value="not-sure">{translations[$language].not_sure}</option>
                    <option value="not-attending">{translations[$language].not_attending}</option>
                </select>
            </div>

            <div class="form-control w-full mb-2">
                <label class="label" for="rsvp-attendees">
                    <span class="label-text">{translations[$language].attendees}</span>
                </label>
                <input
                    type="number"
                    id="rsvp-attendees"
                    bind:value={editingRSVP.attendees}
                    class="input input-bordered w-full"
                />
            </div>

             <div class="form-control w-full mb-4">
                <label class="label" for="rsvp-message">
                    <span class="label-text">{translations[$language].message}</span>
                </label>
                <textarea
                    id="rsvp-message"
                    bind:value={editingRSVP.message}
                    class="textarea textarea-bordered h-24"
                ></textarea>
            </div>

            <div class="modal-action">
                <button class="btn" on:click={closeRSVPModal}>
                    {translations[$language].cancel}
                </button>
                <button class="btn btn-primary" on:click={saveRSVP}>
                    {translations[$language].save_changes}
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button on:click={closeRSVPModal}>close</button>
        </form>
    </dialog>
{/if}

{#if showRSVPDeleteModal}
    <dialog class="modal modal-open" data-theme="valentine">
        <div class="modal-box">
            <h3 class="font-bold text-lg text-error">
                {translations[$language].delete}
            </h3>
            <p class="py-4">
                {translations[$language].rsvp_delete_confirm}
            </p>
            <div class="modal-action">
                <button
                    class="btn"
                    on:click={() => {
                        showRSVPDeleteModal = false;
                        rsvpToDelete = null;
                    }}
                >
                    {translations[$language].cancel}
                </button>
                <button class="btn btn-error" on:click={confirmDeleteRSVP}>
                    {translations[$language].delete}
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button
                on:click={() => {
                    showRSVPDeleteModal = false;
                    rsvpToDelete = null;
                }}
            >
                close
            </button>
        </form>
    </dialog>
{/if}

{#if showToast}
    <div class="toast toast-end">
        <div class="alert alert-success">
            <span>{toastMessage}</span>
        </div>
    </div>
{/if}
