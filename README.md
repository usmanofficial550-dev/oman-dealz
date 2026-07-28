# Oman Dealz — Store Backend

A simple store backend with:
- A public storefront (`/`) that lists your products and takes orders
- An admin panel (`/admin`) to add/edit/delete products and view orders
- A local database (SQLite) — no external database service needed

## 1. Run it locally first (recommended)

You'll need [Node.js](https://nodejs.org) installed on your computer (version 18+).

```bash
cd store-backend
npm install
```

Your `.env` file is already set up with your admin login:
- **Username:** `admin`
- **Password:** the one you chose when this was built for you

(If you ever want to change the password, run `node hash-password.js YourNewPassword` and replace the `ADMIN_PASSWORD_HASH` line in `.env` with the output.)

Start the server:

```bash
npm start
```

Visit:
- **Storefront:** http://localhost:3000
- **Admin panel:** http://localhost:3000/admin (log in with username `admin` and the password you chose)

Add your real products from the admin panel — the sample product will disappear once you add your own and delete it.

## 2. Deploy it live (so it's on the internet)

The easiest hosts for this are **Railway** or **Render** — both have free/cheap tiers and deploy Node apps directly from a GitHub repo.

### Steps (Railway example):
1. Push this folder to a GitHub repository
2. Go to railway.app → New Project → Deploy from GitHub repo
3. Select your repo
4. Your `.env` file is intentionally excluded from Git (for security), so once on Railway, go to the project's **Variables** tab and add the same three values that are in your local `.env` file:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH`
   - `SESSION_SECRET`
5. Railway will detect it's a Node app, run `npm install`, and start it automatically
6. You'll get a live URL like `kindred-goods.up.railway.app` — that's your live store

Render works almost identically (New → Web Service → connect repo → add the same environment variables).

## 3. Connect your domain

Once deployed, go to your domain registrar's DNS settings and add the record your hosting provider gives you (usually a CNAME pointing to your Railway/Render URL). Both platforms have a "Custom Domain" section in their dashboard that walks you through this.

## 4. Adding real payments later

Right now, checkout saves the order but doesn't charge anyone. When you're ready to add Thawani (or another Oman payment gateway):
- The order total and items are already captured in `/api/orders`
- We'll add a step where, instead of saving the order directly, the frontend redirects to Thawani's hosted checkout page, and Thawani calls back to confirm payment before the order is marked paid

## Notes

- Your product images: for now, use direct image URLs (e.g. from your supplier, or an image host like Cloudinary/Imgur). If you want image uploads directly from the admin panel, that's a small addition we can make later.
- All prices are currently in USD — happy to switch the whole store to OMR display formatting when we get there.
- Your products and orders are stored in a file called `data.json` in this folder — back it up occasionally once you have real orders coming in.
