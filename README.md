# Cantina Cuhh

An accessibility-focused web application designed to help blind and low-vision individuals read text from printed documents or images, fill out basic digital forms, and navigate using voice commands and accessible screen-reader-friendly controls.

---

## 🌟 Key Features

1. **Voice Navigation**
   - Built on the browser Web Speech API.
   - Microphone button for speech input with listening feedback.
   - Spoken confirmations for successful actions and commands.
   - Commands:
     - *"Go home"*
     - *"Open camera reader"*
     - *"Open form assistant"*
     - *"Open accessibility settings"*
     - *"Read this page"*
     - *"Pause speaking"* / *"Resume speaking"*
     - *"Stop speaking"*
     - *"Help"*
   - Multilingual support for English (`en-US`) and Tamil (`ta-IN`).
   - Visible keyboard, touch, and button alternatives for every single action.

2. **Camera Reader (OCR Text Extraction)**
   - Upload images from local device storage or capture live photos using the device camera.
   - Fast client-side Optical Character Recognition (OCR) powered by **Tesseract.js**.
   - Live progress indicator and screen-reader announcements.
   - Fully editable extracted text area.
   - Text-to-Speech playback with Play, Pause, Resume, and Stop controls.
   - Complete client-side privacy: images and text remain in the user's browser.

3. **Form Assistant**
   - Accessible form fields with spoken labels and instructions.
   - Dual-input mode: Keyboard typing or direct Voice Dictation per field.
   - Validation for required fields and formats (phone numbers, emails).
   - Review and correction screen before finalizing answers.
   - Client-side PDF export generated using **jsPDF**.
   - Confirmation dialog before clearing forms to prevent accidental data loss.

4. **Accessibility Settings**
   - **Text Scaling**: Normal (18px), Large (22px), Extra Large (26px).
   - **Display Contrast**: High-contrast mode with rich yellow-on-black contrast.
   - **Speech Speed**: Adjustable playback rates (0.75x, 1.0x, 1.25x, 1.5x).
   - **Language Selection**: English (US) and Tamil (India).
   - **Spoken Action Feedback**: Toggleable spoken confirmation.
   - Persistent preferences across page visits via LocalStorage (only non-sensitive UI settings).

---

## 🛠️ Technology Stack

- **React 19** & **Vite 5**
- **JavaScript (ES Modules)**
- **HTML5 & Semantic CSS3**
- **React Router v7**
- **Web Speech API** (`SpeechRecognition` & `speechSynthesis`)
- **Tesseract.js** (client-side WebAssembly OCR)
- **jsPDF** (client-side PDF generation)
- **Lucide React** (accessible icon set)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/cantina-cuhh.git

# Navigate into the project folder
cd "Cantina Cuhh"

# Install dependencies
npm install
```

### Running Locally
```bash
npm run dev
```
Open your browser at the displayed local URL (typically `http://localhost:5173`).

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔒 Privacy & Accuracy Commitment

- **100% Client-Side Processing**: Documents and speech remain on your device. No user data or documents are sent to any external server or stored in a remote database.
- **Accuracy Disclaimer**: OCR algorithms may misread poor-quality photos, complex typography, or handwritten text. Critical medical labels or financial records should always be verified.

---

## 📄 License
MIT License. Created for accessible computing.
