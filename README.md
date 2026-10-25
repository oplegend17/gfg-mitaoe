# GfG Orientation Attendance (MITAOE)

React + Vite + Tailwind v4 + Firebase (Auth + Firestore) on Vercel.
No Cloud Functions, so no Blaze plan needed.

## Setup (about 15 minutes)

1. Firebase Console -> create project -> add a Web app -> copy the config into `.env` (see `.env.example`).
2. Build -> Authentication -> Sign-in method -> enable Email/Password.
   Add ONE user (your admin email + password).
3. Build -> Firestore Database -> create (production mode).
4. Open `firestore.rules`, replace `REPLACE_WITH_ADMIN_EMAIL` with that same email,
   paste into Firestore -> Rules -> Publish.
5. `npm install && npm run dev`
6. Visit `/admin`, sign in, press **Start attendance**.
7. Put the club logo at `public/logo.png` (optional).

## Deploy

Push to GitHub, import into Vercel, add the same `.env` values under
Project Settings -> Environment Variables (set `VITE_PUBLIC_URL` to the Vercel URL), deploy.
`vercel.json` already handles `/admin` refreshes.

## Event day

- Open `/admin` on the laptop connected to the projector, press **Start attendance**, then **Full screen**.
- Students scan the QR, the count goes up by one per phone.
- After the event press **Stop attendance**.
