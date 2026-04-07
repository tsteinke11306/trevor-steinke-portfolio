# IT Portfolio Website

A clean, modern portfolio template for IT professionals.

## Features

- **Responsive design** - Works on desktop, tablet, and mobile
- **Modern styling** - Clean aesthetic with smooth animations
- **Sections included:**
  - About / Bio
  - Skills & Technologies
  - Projects & Work History
  - Certifications
  - Contact Form

## Quick Start

1. Edit `index.html` and replace all placeholder content with your information
2. Add your photo (replace the image placeholder)
3. Customize colors in `styles.css` by editing the CSS variables
4. Deploy to GitHub Pages (free hosting)

## Deploying to GitHub Pages

1. Push this repo to GitHub
2. Go to Settings → Pages
3. Set Source to "Deploy from a branch"
4. Select `main` branch and `/ (root)` folder
5. Your site will be live at `https://yourusername.github.io/your-repo-name/`

## Customization

### Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #2563eb;
    --primary-hover: #1d4ed8;
    --bg-color: #ffffff;
    --bg-alt: #f8fafc;
    --text-color: #1e293b;
    --text-light: #64748b;
}
```

### Contact Form

The contact form is a placeholder. To make it functional, connect it to a service like:

- [Formspree](https://formspree.io/) (free tier available)
- [Netlify Forms](https://www.netlify.com/products/forms/) (if hosting on Netlify)
- Your own backend API

### Adding a Photo

Replace the image placeholder with an actual photo:

```html
<div class="about-image">
    <img src="your-photo.jpg" alt="Your Name" style="width: 250px; border-radius: 16px;">
</div>
```

## License

MIT License - Feel free to use and modify for your own portfolio.