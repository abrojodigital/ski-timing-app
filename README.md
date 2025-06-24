# 🏔️ Ski Timing App

**Ski Timing App** is a mobile application built with **React Native** and **Expo** to accurately log **start and finish impulses** during alpine ski races. It synchronizes with **world time using GPS**, ensuring reliable and precise timing for race officials and coaches.

---

## 📱 Features

- ⏱ **GPS-Based Time Sync**  
  Synchronizes the device's clock with official world time using GPS location and fallback internet services.

- 🔴 **Impulse Recording**  
  Log start/finish pulses with millisecond precision.

- 💬 **Add Comments**  
  Attach optional comments to each impulse entry.

- 🕒 **Live Synchronized Clock**  
  Displays a real-time stopwatch based on synced world time.

- 🧹 **Clear All Entries**  
  Erase all stored data and reset internal IDs.

- 📤 **Export as Excel file**  
  Export all recorded impulses to a KLSX file, ready for sharing or analysis.

- 🗃️ **Offline Storage**  
  Uses SQLite for local data persistence, even without internet.

---

## 🧰 Tech Stack

- **React Native (Expo)**
- **TypeScript**
- **SQLite** via `expo-sqlite`
- **expo-location** for GPS
- **expo-file-system** and **expo-sharing** for CSV export

---

## 🚀 Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/ski-timing-app.git
   cd ski-timing-app
