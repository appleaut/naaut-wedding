import { writable } from 'svelte/store';

export interface WeddingConfig {
    groomName: string;
    groomNickname: string;
    brideName: string;
    brideNickname: string;
    weddingDate: string; // ISO string
    weddingLocation: string;
    themeColor: string;
    description: string;
    showGallery: boolean;
    showGuestbook: boolean;
    showRSVP: boolean;
    showVideo: boolean;
    showMap: boolean;
    showCountdown: boolean;
    showEventDetails: boolean;
    showSchedule: boolean;
    showQRCode: boolean;
    qrCodeStartTime: string;
    qrCodeEndTime: string;
    videoUrl: string;
    galleryImages: string[];
    bankAccount: {
        bankName: string;
        accountName: string;
        accountNumber: string;
    };
    schedule: { time: string; title: string }[];
    sectionOrder: string[];
}

const defaultConfig: WeddingConfig = {
    groomName: "Groom Name",
    groomNickname: "Groom",
    brideName: "Bride Name",
    brideNickname: "Bride",
    weddingDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    weddingLocation: "Wedding Venue",
    themeColor: "valentine",
    description: "We invite you to celebrate our wedding.",
    showGallery: true,
    showGuestbook: true,
    showRSVP: true,
    showVideo: true,
    showMap: true,
    showCountdown: true,
    showEventDetails: true,
    showSchedule: true,
    showQRCode: true,
    qrCodeStartTime: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    qrCodeEndTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    videoUrl: "",
    galleryImages: [],
    bankAccount: {
        bankName: "Bank",
        accountName: "Name",
        accountNumber: "123-456-7890"
    },
    schedule: [],
    sectionOrder: [
        "Countdown",
        "EventDetails",
        "Schedule",
        "Map",
        "Gallery",
        "Video",
        "QRCode",
        "RSVP",
        "Guestbook"
    ]
};

export const config = writable<WeddingConfig>(defaultConfig);

// Subscribe to config changes to update the theme
config.subscribe((value) => {
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', value.themeColor);
    }
});

export const language = writable<'en' | 'th'>('th');
