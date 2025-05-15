# Static Assets for TextExpander Typing Game

This directory contains static assets for the TextExpander Typing Game application.

## Logo Image

The TextExpander logo has been added to the application header. Here's how to replace the placeholder with your actual logo:

1. Place your TextExpander logo image in the `/public/images/` directory
2. Name the file `textexpander-logo.png` (or use one of these formats: .svg, .jpg, .jpeg)
3. If using a different filename or format, update the reference in the Header component:
   - Open `/src/components/Header.tsx`
   - Find the line: `<img src="/images/textexpander-logo.png" alt="TextExpander Logo" />`
   - Change the `src` attribute to match your filename

### Logo Requirements

- Recommended size: approximately 200px width, with appropriate height to maintain aspect ratio
- Transparent background preferred
- PNG format with transparency is currently used, but SVG format is also excellent for best scaling

### Display Options

The current implementation shows both the logo and the text "TextExpander Typing Game". If you prefer to:

- **Show only the logo**: Remove the `<span>TextExpander Typing Game</span>` line in Header.tsx
- **Show only text**: Remove the `<img>` tag in Header.tsx
- **Adjust spacing**: Modify the `margin-right` property in the `img` CSS selector in the Logo styled component

## Favicon

The same logo image is also used as the favicon for the website. If you replace the logo image, the favicon will automatically update as well. If you want to use a different image for the favicon:

1. Place your favicon image in the appropriate directory (e.g., `/public/`)
2. Update the reference in `index.html`:
   - Find the line: `<link rel="icon" type="image/png" href="/images/textexpander-logo.png" />`
   - Change the `href` attribute to match your favicon path

## Other Static Assets

You can place other static assets (additional images, fonts, etc.) in the appropriate subdirectories of `/public/`.
