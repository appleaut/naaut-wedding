<script lang="ts">
  import Navbar from "../components/Navbar.svelte";
  import Hero from "../components/Hero.svelte";
  import Countdown from "../components/Countdown.svelte";
  import EventDetails from "../components/EventDetails.svelte";
  import Schedule from "../components/Schedule.svelte";
  import Map from "../components/Map.svelte";
  import RSVP from "../components/RSVP.svelte";
  import Guestbook from "../components/Guestbook.svelte";
  import Gallery from "../components/Gallery.svelte";
  import Video from "../components/Video.svelte";
  import QRCode from "../components/QRCode.svelte";
  import MusicPlayer from "../components/MusicPlayer.svelte";
  import Footer from "../components/Footer.svelte";
  import { config } from "../lib/store";

  const components: Record<string, any> = {
    Countdown,
    EventDetails,
    Schedule,
    Map,
    Gallery,
    Video,
    QRCode,
    RSVP,
    Guestbook,
  };
</script>

<Navbar />
<Hero />

{#if $config.sectionOrder}
  {#each $config.sectionOrder as sectionName}
    {#if components[sectionName]}
      <div id={sectionName.toLowerCase()}>
        <svelte:component this={components[sectionName]} />
      </div>
    {/if}
  {/each}
{:else}
  <!-- Fallback if sectionOrder is missing -->
  <div id="countdown">
    <Countdown />
  </div>
  <div id="eventdetails">
    <EventDetails />
  </div>
  <div id="schedule">
    <Schedule />
  </div>
  <div id="map">
    <Map />
  </div>
  <div id="gallery">
    <Gallery />
  </div>
  <div id="video">
    <Video />
  </div>
  <div id="qrcode">
    <QRCode />
  </div>
  <div id="rsvp">
    <RSVP />
  </div>
  <div id="guestbook">
    <Guestbook />
  </div>
{/if}

<Footer />
<MusicPlayer />
