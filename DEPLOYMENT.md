# Asocial - Deployment Guide

## Option 1: GitHub Pages (Recommended - FREE)

### Steps:
1. Create a GitHub account (if you don't have one): https://github.com
2. Create a new repository called "asocial"
3. Upload all files from the `asocial` folder
4. Go to Settings → Pages
5. Select "Deploy from main branch"
6. Your app will be live at: `https://yourusername.github.io/asocial/`

**Pros**: Free, professional URL, easy updates
**Cons**: Requires GitHub account

---

## Option 2: Netlify Drop (Super Easy - FREE)

### Steps:
1. Go to https://app.netlify.com/drop
2. Drag the entire `asocial` folder onto the page
3. Get instant URL like: `https://random-name-12345.netlify.app`
4. Optional: customize the subdomain

**Pros**: Easiest deployment, no account needed for basic use
**Cons**: Random URL unless you create account

---

## Option 3: Vercel (FREE)

### Steps:
1. Go to https://vercel.com
2. Sign up (free)
3. Click "Add New" → "Project"
4. Import from Git or drag files
5. Get URL like: `https://asocial.vercel.app`

**Pros**: Fast, professional, good free tier
**Cons**: Requires account creation

---

## Option 4: Zip File (Share Directly)

### Steps:
1. Compress the entire `asocial` folder into a .zip file
2. Send via email, WeTransfer, or Google Drive
3. Recipient extracts and opens `index.html`

**Pros**: Works offline, no hosting needed
**Cons**: Not a "real" website, just local files

---

## Option 5: Neocities (Retro Hosting - FREE)

### Steps:
1. Sign up at https://neocities.org
2. Upload files via web interface
3. Get URL: `https://yourusername.neocities.org`

**Pros**: Free, embraces simple websites, no build process
**Cons**: Bandwidth limits on free tier

---

## Recommended: Netlify Drop (Fastest)

For the quickest "it's a real website" experience:

1. Open https://app.netlify.com/drop in your browser
2. Open File Explorer and navigate to `C:\Users\busie\.gemini\antigravity\scratch\asocial`
3. Drag the ENTIRE `asocial` folder onto the Netlify Drop page
4. Wait 30 seconds
5. Share the URL with anyone!

The app will work immediately and look like a real hosted website.

---

## Important Notes

### Data Persistence
Since the app uses localStorage, each user will have their own local data:
- Bookmarks are personal to each browser
- New posts are only stored locally
- If you want shared data, you'd need a real backend (Firebase, Supabase, etc.)

### Custom Domain (Optional)
With most hosting services, you can add a custom domain like:
- `asocial.app`
- `thisisasocial.com`
- `myasocial.net`

This requires buying a domain (~$10-15/year) but makes it look very professional.

---

## Quick Commands for ZIP Creation

```powershell
# Create a zip file to share
Compress-Archive -Path "C:\Users\busie\.gemini\antigravity\scratch\asocial\*" -DestinationPath "C:\Users\busie\Desktop\asocial.zip"
```

Then send `asocial.zip` to anyone - they extract and open `index.html`.
