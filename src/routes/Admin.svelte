<script lang="ts">
    import { config, language } from "../lib/store";
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

    function toggleLanguage() {
        $language = $language === "th" ? "en" : "th";
    }

    async function fetchConfig() {
        try {
            const docRef = doc(db, "config", "main");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                config.set(docSnap.data() as any);
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
            await setDoc(doc(db, "config", "main"), $config);
            alert("Configuration saved to Firestore!");
        } catch (e: any) {
            console.error("Error saving config:", e);
            alert(`Error saving config: ${e.message}`);
        }
    }

    async function deleteWish(id: string) {
        if (!confirm("Are you sure you want to delete this wish?")) return;
        try {
            await deleteDoc(doc(db, "guestbook", id));
            await fetchGuestbook();
        } catch (e) {
            console.error("Error deleting wish:", e);
            alert("Failed to delete wish.");
        }
    }

    async function testConnection() {
        try {
            const querySnapshot = await getDocs(collection(db, "rsvp"));
            alert(
                `Connection Successful! Found ${querySnapshot.size} RSVP entries.`,
            );
        } catch (e: any) {
            console.error("Connection failed", e);
            alert(`Connection Failed: ${e.message}`);
        }
    }
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
                    >Refresh</button
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
                <button class="btn btn-ghost" on:click={logout}>Logout</button>
            </div>
        </div>

        {#if activeTab === "config"}
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">Website Configuration</h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label" for="groomName"
                                ><span class="label-text">Groom Name</span
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
                                ><span class="label-text">Groom Nickname</span
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
                                ><span class="label-text">Bride Name</span
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
                                ><span class="label-text">Bride Nickname</span
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
                                ><span class="label-text">Wedding Date</span
                                ></label
                            >
                            <input
                                type="datetime-local"
                                id="weddingDate"
                                bind:value={$config.weddingDate}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="weddingLocation"
                                ><span class="label-text">Location</span></label
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
                                ><span class="label-text">Theme</span></label
                            >
                            <select
                                id="themeColor"
                                bind:value={$config.themeColor}
                                class="select select-bordered"
                            >
                                <option value="valentine">Valentine</option>
                                <option value="luxury">Luxury</option>
                                <option value="garden">Garden</option>
                            </select>
                        </div>
                        <div class="form-control">
                            <label class="label" for="videoUrl"
                                ><span class="label-text">Video URL</span
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
                                ><span class="label-text">Description</span
                                ></label
                            >
                            <textarea
                                id="description"
                                bind:value={$config.description}
                                class="textarea textarea-bordered h-24"
                            ></textarea>
                        </div>
                    </div>

                    <div class="divider">QR Code Settings</div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label" for="qrCodeStartTime"
                                ><span class="label-text"
                                    >QR Code Start Time</span
                                ></label
                            >
                            <input
                                type="datetime-local"
                                id="qrCodeStartTime"
                                bind:value={$config.qrCodeStartTime}
                                class="input input-bordered"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="qrCodeEndTime"
                                ><span class="label-text">QR Code End Time</span
                                ></label
                            >
                            <input
                                type="datetime-local"
                                id="qrCodeEndTime"
                                bind:value={$config.qrCodeEndTime}
                                class="input input-bordered"
                            />
                        </div>
                    </div>

                    <div class="divider">Bank Account</div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-control">
                            <label class="label" for="bankName"
                                ><span class="label-text">Bank Name</span
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
                                ><span class="label-text">Account Name</span
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
                                ><span class="label-text">Account Number</span
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

                    <div class="divider">Toggles</div>

                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        <div
                            class="form-control border rounded-lg p-2 hover:bg-base-200 transition-colors"
                        >
                            <label
                                class="label cursor-pointer justify-start gap-4"
                            >
                                <span class="label-text font-medium"
                                    >Show Gallery</span
                                >
                                <input
                                    type="checkbox"
                                    bind:checked={$config.showGallery}
                                    class="toggle toggle-primary"
                                />
                            </label>
                        </div>
                        <div
                            class="form-control border rounded-lg p-2 hover:bg-base-200 transition-colors"
                        >
                            <label
                                class="label cursor-pointer justify-start gap-4"
                            >
                                <span class="label-text font-medium"
                                    >Show RSVP</span
                                >
                                <input
                                    type="checkbox"
                                    bind:checked={$config.showRSVP}
                                    class="toggle toggle-primary"
                                />
                            </label>
                        </div>
                        <div
                            class="form-control border rounded-lg p-2 hover:bg-base-200 transition-colors"
                        >
                            <label
                                class="label cursor-pointer justify-start gap-4"
                            >
                                <span class="label-text font-medium"
                                    >Show Map</span
                                >
                                <input
                                    type="checkbox"
                                    bind:checked={$config.showMap}
                                    class="toggle toggle-primary"
                                />
                            </label>
                        </div>
                        <div
                            class="form-control border rounded-lg p-2 hover:bg-base-200 transition-colors"
                        >
                            <label
                                class="label cursor-pointer justify-start gap-4"
                            >
                                <span class="label-text font-medium"
                                    >Show Video</span
                                >
                                <input
                                    type="checkbox"
                                    bind:checked={$config.showVideo}
                                    class="toggle toggle-primary"
                                />
                            </label>
                        </div>
                        <div
                            class="form-control border rounded-lg p-2 hover:bg-base-200 transition-colors"
                        >
                            <label
                                class="label cursor-pointer justify-start gap-4"
                            >
                                <span class="label-text font-medium"
                                    >Show Guestbook</span
                                >
                                <input
                                    type="checkbox"
                                    bind:checked={$config.showGuestbook}
                                    class="toggle toggle-primary"
                                />
                            </label>
                        </div>
                        <div
                            class="form-control border rounded-lg p-2 hover:bg-base-200 transition-colors"
                        >
                            <label
                                class="label cursor-pointer justify-start gap-4"
                            >
                                <span class="label-text font-medium"
                                    >Show Countdown</span
                                >
                                <input
                                    type="checkbox"
                                    bind:checked={$config.showCountdown}
                                    class="toggle toggle-primary"
                                />
                            </label>
                        </div>
                        <div
                            class="form-control border rounded-lg p-2 hover:bg-base-200 transition-colors"
                        >
                            <label
                                class="label cursor-pointer justify-start gap-4"
                            >
                                <span class="label-text font-medium"
                                    >Show Schedule</span
                                >
                                <input
                                    type="checkbox"
                                    bind:checked={$config.showSchedule}
                                    class="toggle toggle-primary"
                                />
                            </label>
                        </div>
                        <div
                            class="form-control border rounded-lg p-2 hover:bg-base-200 transition-colors"
                        >
                            <label
                                class="label cursor-pointer justify-start gap-4"
                            >
                                <span class="label-text font-medium"
                                    >Show QR Code</span
                                >
                                <input
                                    type="checkbox"
                                    bind:checked={$config.showQRCode}
                                    class="toggle toggle-primary"
                                />
                            </label>
                        </div>
                    </div>

                    <div class="card-actions justify-end mt-4">
                        <button class="btn btn-primary" on:click={saveConfig}
                            >Save Changes</button
                        >
                    </div>
                </div>
            </div>
        {:else if activeTab === "rsvp"}
            <div class="overflow-x-auto bg-base-100 shadow-xl rounded-box">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Attendees</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each rsvps as rsvp}
                            <tr>
                                <td>{rsvp.name}</td>
                                <td>
                                    {#if rsvp.status === "attending"}
                                        <div class="badge badge-success">
                                            Attending
                                        </div>
                                    {:else if rsvp.status === "not-sure"}
                                        <div class="badge badge-warning">
                                            Not Sure
                                        </div>
                                    {:else}
                                        <div class="badge badge-error">
                                            Not Attending
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
            <li class="mb-4 text-xl font-bold px-4">Admin Panel</li>
            <li>
                <button
                    class:active={activeTab === "config"}
                    on:click={() => (activeTab = "config")}
                    >Configuration</button
                >
            </li>
            <li>
                <button
                    class:active={activeTab === "rsvp"}
                    on:click={() => (activeTab = "rsvp")}>RSVP List</button
                >
            </li>
            <li>
                <button
                    class:active={activeTab === "guestbook"}
                    on:click={() => (activeTab = "guestbook")}>Guestbook</button
                >
            </li>
            <div class="divider"></div>
            <li>
                <button on:click={testConnection}
                    >Test Firebase Connection</button
                >
            </li>
            <li><a href="/">View Site</a></li>
        </ul>
    </div>
</div>
