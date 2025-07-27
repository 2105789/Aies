# Vision Assistant

An AI-powered accessibility application designed specifically for blind and visually impaired users. Vision Assistant uses your device's camera to continuously analyze your surroundings and provide real-time audio descriptions, helping you navigate and understand your environment.

## Features

### 🎯 Core Functionality
- **Real-time Environment Analysis**: Continuous monitoring of your surroundings with AI-powered visual analysis
- **Intelligent Audio Feedback**: High-quality text-to-speech responses using Murf AI
- **Automatic Descriptions**: Provides continuous audio descriptions of your environment

### ♿ Accessibility Features
- **Screen Reader Optimized**: Full compatibility with NVDA, JAWS, and VoiceOver
- **Keyboard Navigation**: Complete keyboard control with intuitive shortcuts
- **Audio-First Design**: All interactions designed for audio feedback
- **Focus Management**: Proper focus handling for seamless navigation
- **ARIA Labels**: Comprehensive accessibility markup

### 🎹 Keyboard Shortcuts
- **Space**: Start/Stop Vision Assistant
- **D**: Get immediate description of surroundings
- **R**: Repeat last description
- **?**: Show/Hide keyboard shortcuts help
- **Escape**: Cancel current operation

## Technology Stack

- **Frontend**: Nuxt 3 (Vue.js) with TypeScript
- **Styling**: Tailwind CSS with accessibility-first design
- **AI Vision**: Google Gemini Vision API
- **Text-to-Speech**: Murf AI for natural voice synthesis
- **Camera Access**: WebRTC MediaDevices API

## Prerequisites

- **Node.js**: Version 18 or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge with camera support
- **HTTPS or Localhost**: Required for camera access
- **Camera**: Rear-facing camera recommended for best results

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vision-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   MURF_API_KEY=your_murf_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open `http://localhost:3000` in your browser

## API Keys Setup

### Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### Murf AI API Key
1. Sign up at [Murf AI](https://murf.ai/)
2. Navigate to API settings in your dashboard
3. Generate an API key
4. Add it to your `.env` file as `MURF_API_KEY`

## Usage Guide

### Getting Started
1. **Grant Camera Permission**: When first accessing the app, allow camera access when prompted
2. **Start Vision Assistant**: Press the "Start Vision" button or use the Space key
3. **Listen to Descriptions**: The app will automatically describe your surroundings every 8 seconds
4. **Manual Descriptions**: Use the "Describe Now" button or press 'D' for immediate descriptions

### Navigation Tips
- Use Tab to navigate between buttons
- All buttons provide audio feedback when focused
- The app announces its status changes
- Use keyboard shortcuts for quick access to features

## Browser Compatibility

### Recommended Browsers
- **Chrome**: Full feature support
- **Firefox**: Full feature support
- **Safari**: Full feature support (iOS/macOS)
- **Edge**: Full feature support

### Camera Access Requirements
- **HTTPS**: Required for production deployment
- **Localhost**: Works with HTTP for development
- **Permissions**: Camera access needed

## Deployment

### Production Build
```bash
npm run build
npm run preview
```

### Environment Setup
- Ensure HTTPS is enabled for production
- Configure proper CORS headers
- Set up SSL certificates
- Update API endpoints if needed

## Troubleshooting

### Camera Access Issues
- **Problem**: Camera permission denied
- **Solution**: Access via `https://` or `localhost`, check browser settings

### Audio Not Working
- **Problem**: No voice output
- **Solution**: Check browser audio permissions, ensure speakers/headphones are connected



### Performance Issues
- **Problem**: Slow responses
- **Solution**: Ensure stable internet connection, check API key limits

## Accessibility Standards

This application follows:
- **WCAG 2.1 AA** compliance
- **Section 508** standards
- **WAI-ARIA** best practices
- **Keyboard navigation** requirements
- **Screen reader** compatibility

## Contributing

We welcome contributions to improve accessibility and functionality:

1. Fork the repository
2. Create a feature branch
3. Follow accessibility guidelines
4. Test with screen readers
5. Submit a pull request

## Privacy & Security

- **Camera Data**: Processed locally and via secure APIs only
- **No Storage**: No personal data is stored permanently
- **API Security**: All API calls use secure HTTPS connections

## Support

For support or accessibility feedback:
- Create an issue on GitHub
- Ensure you include browser and assistive technology details
- Describe the accessibility barrier encountered

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Google Gemini**: For powerful vision AI capabilities
- **Murf AI**: For natural text-to-speech synthesis
- **Accessibility Community**: For guidance and feedback
- **Open Source Contributors**: For making this project possible

---

**Vision Assistant** - Empowering independence through AI-powered vision assistance.