# Napawan Wedding Invitation App

This is a web application for the Napawan Wedding Invitation, built with [Svelte](https://svelte.dev/), [Vite](https://vitejs.dev/), and [Tailwind CSS](https://tailwindcss.com/). It uses [Firebase Hosting](https://firebase.google.com/docs/hosting) for deployment.

## Features

- **Interactive UI**: Built with Svelte and DaisyUI for a beautiful and responsive design.
- **Music Player**: Background music playback with user controls.
- **Map Integration**: Leaflet maps for venue location.
- **PromptPay Integration**: TypeScript support for PromptPay QR generation (implied by `src/lib/promptpay.ts`).

## Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Firebase CLI](https://firebase.google.com/docs/cli) (for deployment)

## Getting Started

### 1. Installation

Clone the repository (if you haven't already) and install the dependencies:

```bash
npm install
```

### 2. Running Locally

To run the application in development mode with hot-reload:

```bash
npm run dev
```

The application will usually be available at `http://localhost:5173`. If that port is busy, Vite will automatically switch to another port (look at the terminal output).

### 3. Building for Production

To create a production-ready build:

```bash
npm run build
```

The built files will be generated in the `dist` directory.

### 4. Deployment

This project is configured to deploy to Firebase Hosting.

**Prerequisites for Deployment:**
- Ensure you have the Firebase CLI installed: `npm install -g firebase-tools`
- Login to Firebase: `firebase login`

**To Deploy:**

Depending on your workflow, you might want to build before deploying to ensure you are uploading the latest version:

```bash
npm run build && npx firebase deploy
```

This command acts on the configurations found in `firebase.json` and `.firebaserc`.

## Project Structure

- `src/`: Source code including components and logic.
- `public/`: Static assets.
- `firebase.json`: Firebase Hosting configuration.
- `vite.config.ts`: Vite configuration.
- `tailwind.config.js`: Tailwind CSS configuration.
