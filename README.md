# A Little Love Letter

A responsive, buildless romantic website, made with HTML, CSS, and vanilla JavaScript.

## Open it

Open `dist/index.html` in a modern browser. No installation or build step is required. Or serve the `dist` folder with any static web server.

## Make it hers

The flowers are sample images, not personal photos. Replace them before sending your gift.

**Using the website:** Select **Make it yours** (the sparkle button on phones), add six JPG, PNG, or WebP photos, change her nickname and love messages, and save. These changes are stored only in that browser. **Download settings** creates a personalized `config.js` with the photos embedded. Replace `dist/config.js` with that downloaded file, then republish or share the entire `dist` folder. Saving in the browser alone does not update the hosted website for other visitors.

**Editing files:** Put her pictures into `dist/assets/`, then edit their paths and the messages in `dist/config.js`. Adjust each `position` value, such as `50% 35%`, to move the crop toward her face. Images use `object-fit: cover`, preserving proportions. Keep notes below 300 characters so they fit the hearts. Edit the title in `dist/index.html` and colors in `dist/styles.css`.

To preview the original file settings after customizing in the browser, clear this site’s local storage or open it in a private browser window.

## The experience

- Click or keyboard-activate a heart to reveal its note; click again to see the photo.
- Discover all six notes to unlock the final letter. Use **A little more love** to start over.
- **Sound off** starts a gentle, original synthesized melody. Click again to pause. No music file or autoplay is used.
- Motion respects the device’s reduced-motion preference. Native dialogs support Escape, focus trapping, and keyboard use.
- The website works without a backend. The optional Google Fonts have Georgia/Arial fallbacks.

## Files

- `dist/index.html` — page structure
- `dist/styles.css` — responsive layout and animations
- `dist/script.js` — heart reveals, music, final letter, personalization
- `dist/config.js` — editable photos and words
- `dist/assets/` — sample photos and heart favicon

Floral sample photographs: [spring flowers](https://images.unsplash.com/photo-1490750967868-88aa4486c946) and [pink flower](https://images.unsplash.com/photo-1525310072745-f49212b5ac6d), delivered from Unsplash. They are included locally so the photo frames work offline.

Hosted Sites start private. Configure sharing deliberately when you are ready to send the hosted gift to someone else.
