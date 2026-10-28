# 🚨 Mecra Mobile Application | Official Emergency Response Prototype

> **Live Production Mobile App**: Designed for high-stress crisis management, situational agentic assistance, automated priority contact escalation, vehicle breakdown recovery, and transit guardian tracking.

---

## 📱 Project Overview

**Mecra Application** is the standalone mobile application prototype developed directly alongside the Mecra portfolio website. It translates theoretical emergency concepts into an interactive, real-time client-side application.

While keeping user data fully private via **zero-cloud local JSON storage**, the app integrates real browser geolocation (HTML5 Geolocation API + OpenStreetMap reverse geocoding), an interactive 2D radar vector map with direction vectors, and a situational **Agentic Emergency AI** with tool execution capabilities.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: React 19 + TypeScript (Strict typing & safety)
- **Bundler & Build Tool**: Vite 8 (Sub-3s production builds)
- **Design & UI**: Tailwind CSS v4 (Mobile-first responsive architecture, radar pulses, iOS safe area insets)
- **Iconography**: Lucide React
- **Client Routing**: React Router v7 (SPA architecture with seamless mobile transitions)
- **Storage Layer**: Local JSON Database with simulated REST API asynchronous handlers
- **Location Services**: Browser Geolocation API + OpenStreetMap Nominatim reverse geocoding + Haversine matrix
- **Communication APIs**: Native Device Web Share API, WhatsApp URI schemes, native telephony dialer (`tel:`)
- **Hosting & Deployment**: Vercel ready with client-side SPA rewrites (`vercel.json`)

---

## 🌟 Core Features & Modules

### 1. Main Mobile Dashboard & SOS Action
- **One-Tap Emergency SOS**: Central high-impact button with pulsating radar waves, 3-second cancel countdown buffer, and haptic feedback.
- **Situation Category Selector**:
  - 🛡️ *I Feel Unsafe* (Step-by-step calming next steps)
  - 🩺 *Medical Emergency* (Level 1 Trauma hospital alert with allergy/blood type brief)
  - 🚗 *Vehicle Breakdown* (Roadside mobile mechanic dispatch)
  - 👤 *Assault / Harassment* (Immediate station alert)
  - 🔥 *Fire & Chemical Hazard* (Fire station dispatch)
  - 📍 *Lost & Stranded Alone* (Live location link & guidance to safe haven)
- **Live Dispatch Banner**: Flashes live status when an alert is active, showing the alerted police station, contact escalation order, and **"I AM SAFE NOW"** resolution button.

### 2. Situational Agentic AI Assistant
- Context-aware chatbot connected to live GPS coordinates, battery level, medical profile, and trusted contacts.
- **Tool-Calling Capabilities**:
  - `executeEmergencyProtocol()`: Formulates alert payload and flags nearby police desk.
  - `findNearestHospital()`: Locates closest 24/7 ER trauma center.
  - `locateRoadsideAssistance()`: Dispatches mobile mechanics for flat tyres, battery jumpstarts, and towing.
  - `generateLiveShareLink()`: Produces secure 60-minute location tracking link.
  - `markUserSafeAndNotify()`: Cancels alerts and records safety confirmation.
- Multi-language switching (English, Spanish, Hindi, French, Tamil) and **Text-to-Speech** audible instructions.

### 3. Interactive Vector Radar Map & Nearby Rescue Points
- Visual 2D radar sweep with live distance rings (500m, 1km, 3km, 5km).
- Categorized live markers: Police Stations (Blue), Hospitals (Red), Mechanics (Amber), Fuel Stations (Green), and Safe Havens (Indigo).
- Direction trajectory vectors connecting user pin to selected rescue station with distance in km.
- Direct Call and Google Maps turn-by-turn navigation deep-links.

### 4. Vehicle Breakdown Assistance
- Vehicle selector: Car, Motorcycle, Scooter, Truck, Van.
- Issue picker: Flat tyre, dead battery, engine overheating, out of fuel, towing required, brake failure.
- Optional vehicle photo capture simulation.
- Real-time mobile mechanic dispatch tracker with live ETA countdown and safety precautions.

### 5. Guardian Mode (Transit Safety Watch)
- Route setup: Destination entry (Home, Campus, Metro), ETA selector, and trusted contact assignment.
- Periodic 10-minute check-in prompt (*"I'm Safe / Progressing"*).
- Missed check-in anomaly handling with automatic escalation to contacts.
- Extend journey (+15 mins) and Safe Arrival completion.

### 6. Safety Advisories & Community Hazards
- Verified official alerts from Disaster Management Authorities (flash floods, road closures).
- Community hazard reporting tool with automatic **"Unverified Report"** safety tagging.

### 7. Trusted Contacts & Emergency Medical ID
- 3-tier Priority Contacts (Priority 1 Primary, Priority 2 Secondary, Priority 3 Safety Circle).
- One-click WhatsApp emergency alert generator with exact GPS coordinates and Google Maps link.
- Emergency Medical ID storing blood type, chronic conditions, and ICE emergency responder notes.
- GDPR compliant data purge (*"Clear All Data"*).

---

## 🚀 Deployment Instructions (Vercel)

1. **Initialize Git & Push to your new repository**:
   ```bash
   cd Merca-Application
   git init
   git branch -M main
   git add .
   git commit -m "feat: initial commit for Mecra Mobile Application prototype"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your newly created GitHub repository.
   - Framework preset will automatically detect **Vite**.
   - Click **Deploy**! Your application will be live globally on a fast `.vercel.app` domain.
