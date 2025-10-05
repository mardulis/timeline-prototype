# Timeline Prototype

A React-based timeline application for visualizing documents across different time scales (Year, Month, Day views).

## Features

- **Multi-scale Timeline Views**: Year, Month, and Day perspectives
- **Interactive Minimap**: Navigate quickly through time periods
- **Document Preview Panel**: View document details without losing context
- **Smart Scrolling**: Intelligent horizontal and vertical scrolling
- **Responsive Design**: Works on desktop and mobile devices

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Deployment

This app is configured for easy deployment to Vercel:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new one
   - Choose your Vercel account
   - Confirm build settings (should auto-detect React)

4. **Get your live URL** and share with others!

## Alternative Deployment Methods

- **GitHub Integration**: Connect your GitHub repo to Vercel for automatic deployments
- **Manual Upload**: Use Vercel's web interface to upload the `build` folder
- **Other Platforms**: Netlify, AWS S3, or any static hosting service

## Technical Details

- **Framework**: React 19 with TypeScript
- **Styling**: Styled Components
- **Build Tool**: Create React App
- **Deployment**: Optimized for Vercel with caching headers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)