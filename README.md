# VOLNA Russian Night Club

Customer website for Arpora, Goa. Next.js App Router, server-side Firestore and Razorpay Standard Checkout. The staff desk is available at /admin.

## Run locally

Use Node.js 22 or 24. Run `npm ci` then `npm run dev`. Open http://localhost:3000. For a production build run `npm run build` then `npm start`. Without credentials, pages and the price calculator work and checkout is visibly unavailable.

## Firebase and Vercel

Create a separate Firebase project and enable Firestore in Native mode. Keep client access to the bookings collection denied. All database reads and writes use a server service account. Copy .env.example to .env.local or set its six variables on the relevant Vercel project. FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are server service account values. A quoted multiline private key or a key with escaped newlines is supported. Do not put any credentials into GitHub or NEXT_PUBLIC variables.

## Edit website details

In Firestore create collection `site`, document `public`. All listed fields are strings. Changes are read on the next server request; an already-open page may need a refresh.

| Field | Value |
| --- | --- |
| phone | Public phone number with country code |
| whatsapp | WhatsApp number including country code |
| email | Club contact email |
| address | Public venue address |
| mapUrl | Full HTTPS Google Maps place/directions link or maps.app.goo.gl link |
| mapEmbedUrl | HTTPS Google Maps embed URL only (copy the src value from the iframe) |
| cancellationPolicy | The club-approved cancellation, refund, date-change and no-show terms |

Blank contact fields are hidden. The default map uses the listing coordinates 15.569709, 73.7655682 and the directions button uses Google Place ID ChIJw47-0iTrvzsRGbuLgZpVCF8. The club bill provides the logo and the stage image is the poster of the owner's YouTube Short BHbCeP3xWhM. The Watch button opens that video. Package definitions are in lib/catalog.js. Entry costs ₹2,000 per person and a ₹30,000 VIP table covers six guests. A 50% advance is calculated on the server. No capacity or real-time availability claims are made.

## Razorpay commissioning

Use the club's matching test-mode key ID and secret first. Set auto-capture in the merchant account. Add a webhook for `payment.captured` at `https://YOUR-DOMAIN/api/webhook`; set the same webhook secret on the website. Supply all six settings and publish the actual cancellation policy to enable checkout. The policy text and prices are stored on each booking. Bookings are issued only after the signed callback and captured payment lookup, or independently after a signed captured webhook with matching amount, currency and order. There is no automatic refund or cancellation service in this version.

Test a successful and a dismissed checkout, failed payment, and repeat webhook. Verify paid amount and balance in the private pass link, reload it, and test lost-callback recovery. Test on a separate Firebase project and test-mode gateway before introducing production keys. Keep pass links private; they are random access tokens. The code does not send passes by WhatsApp/email. Guests can return to their last booking in the same browser tab.

## Staff desk at /admin

Enable Email/Password in Firebase Authentication, create each staff account in the Firebase console, then copy its UID into the server environment variable VOLNA_ADMIN_UIDS (comma-separated for multiple administrators). Set FIREBASE_WEB_API_KEY to the project's public Web API key. This key only identifies the Firebase project. Every admin API call checks the token, revocation and the server-side UID allowlist. All approved admins have full desk and settings access. The session is held in memory and closes after 15 minutes or a page refresh. Restrict Firestore client access; all app writes use the server SDK.

Choose a Goa visit date to see pending and confirmed bookings. Search by guest, phone or pass reference. For groups, record the arriving or departing count on their booking and record counter payments in rupees. The remaining balance also updates on the customer's pass. The desk keeps an audit record per action in bookings/{id}/deskEvents. Concurrent updates require a refreshed booking version. No refund or charge is initiated by recording counter cash.

Publish package changes from Packages and edit contact information, map or cancellation terms from Settings. Changes apply on the next server request. Existing bookings retain their accepted amounts and policy. The initial two packages use 50% advance.

Publish the supplied firestore.rules on the separate VOLNA Firebase project before adding guest information. The website and admin both use server access. Firebase sign-in alone does not grant control of bookings or settings.
