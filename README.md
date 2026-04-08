# Trevor Steinke - IT Portfolio

Live portfolio website at [trevorsteinke.com](https://trevorsteinke.com)

## About

IT Technician portfolio showcasing skills, projects, and professional development. Built with clean, modern design and deployed via GitHub Pages with a custom domain.

## Features

- **Responsive design** - Works on all devices
- **Dark mode** - System preference detection + manual toggle
- **Contact form** - Emails submissions directly to inbox
- **Analytics** - Self-hosted, privacy-friendly page tracking
- **Social sharing** - Open Graph tags for nice link previews

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Hosting | GitHub Pages |
| DNS | Cloudflare |
| Contact API | Node.js on VPS (port 8443) |
| Analytics | SQLite + Node.js on VPS |

## Infrastructure

```
trevorsteinke.com (GitHub Pages)
    ├── Static HTML/CSS/JS
    └── Contact form → api.trevorsteinke.com:8443
                         ├── POST /api/contact (send email)
                         ├── POST /api/analytics (track views)
                         └── GET /api/analytics/stats (dashboard)

Analytics Dashboard: trevorsteinke.com/analytics.html
```

## Services

- **Contact form backend** - `portfolio-contact.service` on VPS
- **Reverse proxy** - Caddy on port 8443
- **Email** - Gmail SMTP relay → inbox

## Updating Content

Edit `index.html` directly. Changes auto-deploy via GitHub Pages.

For server-side changes (contact/analytics), SSH into the VPS:
```bash
systemctl restart portfolio-contact
```

## Analytics Login

- URL: https://trevorsteinke.com/analytics.html
- Credentials stored in `/root/portfolio-contact/.env`

---

*Built and maintained by Trevor Steinke*