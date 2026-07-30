# Putting the kiosk on an iPad

## 1. Install as a web app

1. On the iPad, open **Safari** and go to `https://<your-domain>/kiosk`.
2. Tap the **Share** button → **Add to Home Screen** → name it
   "Aileen's Beauty" → Add.
3. Launch from the new home-screen icon. It opens full-screen (no Safari
   address bar) thanks to the PWA manifest.

## 2. Lock the iPad to the app (Guided Access)

Guided Access keeps guests inside the check-in app:

1. **Settings → Accessibility → Guided Access** → turn **On**.
2. Set a **Passcode** only staff know (this is also how you exit).
3. Optional: **Time Limits** off, **Display Auto-Lock → Never**
   (Settings → Display & Brightness) so the screen stays on.
4. Open the Aileen's Beauty app, then **triple-click the top/side button** →
   **Start**.

To exit: triple-click again, enter the passcode, tap **End**.

## 3. Kiosk behavior built into the app

- The admin dashboard is a separate, password-protected area — nothing on the
  kiosk links to it.
- All guest data clears immediately after each check-in; the confirmation
  screen shows only the guest's first name and returns to the welcome screen
  after 15 seconds.
- If a guest walks away mid-flow, a "Are you still there?" prompt appears
  after 60 seconds of inactivity and the kiosk resets shortly after.
- Large tap targets, large text, and no browser chrome.

## 4. Staff tips

- Keep the iPad plugged in and mounted at a slight incline.
- The front-desk device can keep the dashboard (`/admin`) open in a separate
  device/browser with the notification sound on — new check-ins chime.
- If the kiosk ever looks stuck, exit Guided Access, pull down to close the
  app, and reopen it.
