# Pirinku Website

A Next.js based web application that helps users find cooking recipes using AI technology. This project uses Google AI (Gemini) for recipe suggestions and Firebase for data management.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18 or higher)
- npm (Node Package Manager)
- Git
- A code editor (VS Code recommended)
- Google AI (Gemini) API key
- Firebase account and project setup

## Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/rafiikkodev/pirinku-website.git
   cd pirinku-website
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add the following:

   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Replace `your_gemini_api_key_here` with your actual Gemini API key.

4. **Firebase Configuration**
   - Create a new project in Firebase Console
   - Set up Firebase in your project following Firebase documentation
   - Add Firebase configuration to your environment variables if required

## Development

The project requires running two servers simultaneously:

1. **Start the Next.js Development Server**

   ```bash
   npm run dev
   ```

   This will start the Next.js server on port 9002 (http://localhost:9002)

2. **Start the Genkit Development Server**
   In a new terminal:
   ```bash
   npm run genkit:dev
   ```
   This runs the AI service integration

## Available Scripts

- `npm run dev` - Starts the Next.js development server with Turbopack
- `npm run genkit:dev` - Starts the Genkit AI service
- `npm run genkit:watch` - Starts Genkit in watch mode
- `npm run build` - Creates a production build
- `npm start` - Runs the production build
- `npm run lint` - Runs linting
- `npm run typecheck` - Runs TypeScript type checking

## Project Structure

```
pirinku-website/
├── src/
│   ├── ai/            # AI integration files
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   └── lib/          # Utility functions
├── public/           # Static files
└── docs/            # Documentation
```

## Technologies Used

- **Frontend Framework**: Next.js 15.3
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **AI Integration**: Google AI (Gemini)
- **Backend Services**: Firebase
- **Form Handling**: React Hook Form
- **Type Checking**: TypeScript
- **Data Validation**: Zod

## Features

- AI-powered recipe suggestions
- Voice input support
- Responsive design
- Modern UI components
- Real-time data updates
- Form validation
- Toast notifications

## Troubleshooting

If you encounter any issues:

1. **Port Already in Use**

   ```bash
   kill $(lsof -t -i:9002)  # For Unix/Mac
   # OR
   netstat -ano | findstr :9002  # For Windows
   taskkill /PID <PID> /F
   ```

2. **Genkit Issues**
   - Ensure your API key is correctly set in `.env`
   - Check if both servers are running
   - Clear browser cache and reload

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Rafiikko Dev - [@rafiikkodev](https://github.com/rafiikkodev)

Project Link: [https://github.com/rafiikkodev/pirinku-website](https://github.com/rafiikkodev/pirinku-website)
