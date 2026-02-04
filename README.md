# Be My Valentine 💌

A tiny, single-page Valentine web app that works on desktop and mobile browsers.  
It shows an intro, 5 fun multiple‑choice questions (all answers are “correct” with a celebratory GIF), a playful **“Will you be my Valentine?”** screen with an impossible‑to‑tap **No** button, and a final note after clicking **Yes**.

## How to run locally

1. Open the project folder: `c:\Users\USER\Desktop\project`.
2. Double‑click `index.html` to open it in your browser (Chrome/Edge/etc).
3. To test on your phone on the same Wi‑Fi:
   - Option A (easiest): Upload the folder to GitHub and use GitHub Pages (see below).
   - Option B: Run a simple static server (e.g. `npx serve .`) and open the LAN URL on your phone.

## Customizing the content

- **Texts & questions**: Edit the headings, paragraphs, and button labels directly in `index.html`.
- **Number of questions**:  
  - Each question is a `<section class="screen" data-screen="qX">` block.  
  - If you add/remove screens, update the `order` array near the top of `script.js` so it matches the sequence.
- **GIF / meme**:  
  - In `index.html`, replace the `src` inside the `#celebrate` overlay `<img>` tag with any GIF URL (e.g. from Giphy).
- **Colors & style**:  
  - Adjust colors, fonts, and spacing in `styles.css` (for example, change the `--bg-gradient` or `--primary` color variables).

The “No” button behaviour (running away + growing “Yes” button) is implemented in `script.js` — you can tweak the speed/scale by editing the `moveNoButton` function.

## Hosting on GitHub Pages

1. Create a new GitHub repository (public or private).
2. Copy everything from this folder into the repo (`index.html`, `styles.css`, `script.js`, `README.md`).
3. Commit and push your changes.
4. In the repository on GitHub:
   - Go to **Settings → Pages**.
   - Under **Source**, select `main` (or `master`) branch and the `/ (root)` folder, then save.
5. After a minute or two, GitHub will show a URL for your site (something like `https://your-username.github.io/your-repo/`).  
   Share that link with your Valentine. ❤️

