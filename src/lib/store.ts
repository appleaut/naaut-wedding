import { writable } from 'svelte/store';
import { hexToOklch } from './colorUtils';

export interface WeddingConfig {
    groomName: string;
    groomNickname: string;
    brideName: string;
    brideNickname: string;
    weddingDate: string; // ISO string
    weddingLocation: string;
    themeColor: string;
    customColors: string[]; // Array of hex strings
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
    customColors: ["#570df8", "#f000b8", "#37cdbe", "#3d4451", "#ffffff"],
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
        const vars = ['--p', '--s', '--a', '--n', '--b1'];
        const contentVars = ['--pc', '--sc', '--ac', '--nc', '--bc'];

        if (value.themeColor === 'custom') {
            document.documentElement.setAttribute('data-theme', 'light');

            if (value.customColors) {
                value.customColors.forEach((color, index) => {
                    if (index < vars.length && color) {
                        try {
                            const oklch = hexToOklch(color);
                            document.documentElement.style.setProperty(vars[index], oklch);

                            // Calculate content color contrast
                            const [l] = oklch.split(' ').map(parseFloat);
                            // If lightness is high, use black content, else white
                            // Using 0 0 0 (black) and 1 0 0 (white) for OKLCH
                            document.documentElement.style.setProperty(contentVars[index], l > 0.65 ? '0 0 0' : '1 0 0');
                        } catch (e) {
                            console.error('Invalid color', color);
                        }
                    }
                });
            }
        } else {
            document.documentElement.setAttribute('data-theme', value.themeColor);
            // Remove custom properties
            [...vars, ...contentVars].forEach(v => {
                document.documentElement.style.removeProperty(v);
            });
        }
    }
});

export const language = writable<'en' | 'th'>('th');
