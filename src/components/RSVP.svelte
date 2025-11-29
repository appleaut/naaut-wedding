<script lang="ts">
  import { config, language } from "../lib/store";
  import { translations } from "../lib/translations";
  import { db } from "../lib/firebase";
  import { collection, addDoc } from "firebase/firestore";

  let name = "";
  let attendees = 1;
  let message = "";
  let status = "attending"; // attending, not-attending
  let submitting = false;
  let success = false;

  async function handleSubmit() {
    submitting = true;
    try {
      await addDoc(collection(db, "rsvp"), {
        name,
        attendees:
          status === "attending" || status === "not-sure" ? attendees : 0,
        message,
        status,
        timestamp: new Date(),
      });

      success = true;
      name = "";
      attendees = 1;
      message = "";
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Error submitting RSVP. Please try again.");
    } finally {
      submitting = false;
    }
  }
</script>

{#if $config.showRSVP}
  <div id="rsvp" class="hero bg-white py-20 font-sans text-wedding-dark">
    <div class="hero-content flex-col w-full max-w-lg">
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-serif mb-4">
          {translations[$language].rsvp}
        </h1>
        <p class="text-sm tracking-widest uppercase opacity-60">
          Please respond by {new Date($config.weddingDate).toLocaleDateString(
            $language === "th" ? "th-TH" : "en-GB",
          )}
        </p>
      </div>
      <div class="card shrink-0 w-full bg-wedding-beige shadow-sm rounded-none">
        {#if success}
          <div class="card-body text-center py-16">
            <h2 class="text-2xl font-serif mb-4 text-wedding-green">
              {translations[$language].thank_you}
            </h2>
            <p class="mb-6">{translations[$language].response_recorded}</p>
            <button
              class="btn btn-ghost hover:bg-transparent underline"
              on:click={() => (success = false)}
              >{translations[$language].submit_another}</button
            >
          </div>
        {:else}
          <form class="card-body" on:submit|preventDefault={handleSubmit}>
            <div class="form-control">
              <label class="label" for="name">
                <span class="label-text font-serif text-lg"
                  >{translations[$language].name}</span
                >
              </label>
              <input
                type="text"
                id="name"
                placeholder={translations[$language].name}
                class="input input-bordered bg-white rounded-none focus:outline-none focus:border-wedding-dark"
                bind:value={name}
                required
              />
            </div>

            <div class="form-control">
              <label class="label" for="status">
                <span class="label-text font-serif text-lg"
                  >{translations[$language].will_you_attend}</span
                >
              </label>
              <select
                id="status"
                class="select select-bordered bg-white rounded-none focus:outline-none focus:border-wedding-dark"
                bind:value={status}
              >
                <option value="attending"
                  >{translations[$language].attending}</option
                >
                <option value="not-attending"
                  >{translations[$language].not_attending}</option
                >
                <option value="not-sure"
                  >{translations[$language].not_sure}</option
                >
              </select>
            </div>

            {#if status === "attending" || status === "not-sure"}
              <div class="form-control">
                <label class="label" for="attendees">
                  <span class="label-text font-serif text-lg"
                    >{translations[$language].number_of_guests}</span
                  >
                </label>
                <input
                  type="number"
                  id="attendees"
                  min="1"
                  max="10"
                  class="input input-bordered bg-white rounded-none focus:outline-none focus:border-wedding-dark"
                  bind:value={attendees}
                />
              </div>
            {/if}

            <div class="form-control">
              <label class="label" for="message">
                <span class="label-text font-serif text-lg"
                  >{translations[$language].message}</span
                >
              </label>
              <textarea
                id="message"
                class="textarea textarea-bordered h-24 bg-white rounded-none focus:outline-none focus:border-wedding-dark"
                placeholder={translations[$language].congratulations}
                bind:value={message}
              ></textarea>
            </div>

            <div class="form-control mt-8">
              <button
                class="btn bg-wedding-dark text-white hover:bg-black rounded-none border-none"
                disabled={submitting}
              >
                {#if submitting}
                  <span class="loading loading-spinner"></span>
                {/if}
                {translations[$language].submit}
              </button>
            </div>
          </form>
        {/if}
      </div>
    </div>
  </div>
{/if}
