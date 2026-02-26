# 🎥 Vishva Vlogs — Creator Portfolio Website

A dynamic personal brand website for a YouTube content creator.
The site automatically displays the latest uploaded videos and shorts using the YouTube RSS feed — no manual updates required.

You can chech it here : 
https://tejeshyewale.github.io/vishva-vlogs/
---

## 🌐 Live Features

* Auto‑updating Latest Video
* Auto‑updating Shorts Grid
* Dark Neon Creator Theme (Gen‑Z style)
* Responsive Mobile Layout
* Glassmorphism UI
* Animated Counters & Scroll Effects
* 1K Subscriber Goal Progress Bar
* Social & Collaboration Section
* GitHub Pages Ready (Static Hosting)

---

## 🛠 Tech Stack

* **HTML5** — Structure
* **CSS3** — Styling & Animations
* **JavaScript (Vanilla)** — Dynamic behavior
* **YouTube RSS Feed** — Fetch latest uploads
* **rss2json API** — CORS‑safe feed conversion
* **GitHub Pages** — Hosting

---

## 📂 Project Structure

```
index.html     → Main website layout
styles.css     → Theme & animations
script.js      → Auto‑update YouTube logic
```

---

## 🔄 How Auto Update Works

1. Website loads
2. JavaScript requests YouTube channel RSS feed
3. rss2json converts feed → JSON
4. Latest video & shorts automatically inserted

Fallback videos appear if feed fails.

---

## ✏️ How To Customize

### Change Channel

Open `script.js` and replace:

```
const CHANNEL_ID = "Vishva Vlogs";
```

---

### Change Social Links

Open `index.html` and update:

```
https://www.youtube.com/@Vishva_Vlogs
Email Address
```

---

### Update Subscriber Goal

In `index.html`:

```
750 / 1000
```

and

```
data-width="75%"
```

---

## 🚀 Deployment (GitHub Pages)

1. Upload files to repository
2. Go to **Settings → Pages**
3. Select:

   * Source → Deploy from branch
   * Branch → main
   * Folder → /root
4. Save

Your site will be live at:

```
https://tejeshyewale.github.io/vishva-vlogs/
```

---

## 💡 Tips

* Upload regularly — site updates automatically
* Shorts appear after newest upload
* Works without backend server

---

## 📜 License

This project is open‑source under the MIT License.

---

## 🙌 Credits

Designed for personal creator branding and portfolio showcase.

Built with ❤️ for content creators.
