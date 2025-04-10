
# CipherScribe - RSA Encryption Tool

A simple web application for RSA key generation, encryption, and decryption.

## Project Overview

CipherScribe is a web-based tool that allows users to:
- Generate RSA key pairs
- Encrypt messages using RSA public keys
- Decrypt messages using RSA private keys
- Track encryption/decryption history

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- node-forge (for RSA operations)

## Getting Started

### Prerequisites

- Node.js & npm installed

### Running Locally

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd cipher-scribe-easy-rsa

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for Production

```sh
# Build the project
npm run build

# Preview the production build
npm run preview
```

## Features

- Secure RSA key generation with customizable key sizes
- Text and file encryption/decryption
- Session-based authentication
- Responsive design for desktop and mobile devices
- Dark mode support

## Project Structure

- `/src/components` - React components
- `/src/utils` - Utility functions for cryptography
- `/src/hooks` - Custom React hooks
- `/src/pages` - Page components

## Security Considerations

- All cryptographic operations are performed client-side
- No keys or sensitive data are transmitted to any server
- Session data is stored temporarily in the browser's session storage
