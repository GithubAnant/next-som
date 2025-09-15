# Project Next - GitHub Integration Dashboard

A modern React application that provides a streamlined interface for GitHub operations with AI-powered assistance. This dashboard allows you to connect your GitHub account and perform various repository operations through an intuitive interface.

## ✨ Features

- **GitHub Integration**: Connect your GitHub account using Personal Access Token
- **AI-Powered Assistance**: Leverage OpenRouter API for intelligent GitHub operations
- **Repository Management**: Create, view, and manage repositories
- **Issue Tracking**: Create and view GitHub issues
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly across different screen sizes

## 🚀 Quick Setup

Follow these steps to get the project running locally:

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A GitHub account
- An OpenRouter account

### 1. Clone the Repository

```bash
git clone https://github.com/GithubAnant/next-som.git
cd next-som
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up GitHub Personal Access Token

1. **Go to your GitHub account settings**:
   - Navigate to [GitHub Settings](https://github.com/settings/profile)
   - Click on "Developer settings" in the left sidebar
   - Click on "Personal access tokens" → "Tokens (classic)"

2. **Create a new token**:
   - Click "Generate new token (classic)"
   - Give your token a descriptive name (e.g., "Project Next Dashboard")
   - Set expiration as needed

3. **Configure token permissions**:
   Select the following scopes for full functionality:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **admin:org** (Full control of orgs and teams, read and write org projects)
   - ✅ **admin:public_key** (Full control of user public keys)
   - ✅ **admin:repo_hook** (Full control of repository hooks)
   - ✅ **admin:org_hook** (Full control of organization hooks)
   - ✅ **gist** (Create gists)
   - ✅ **notifications** (Access notifications)
   - ✅ **user** (Update ALL user data)
   - ✅ **delete_repo** (Delete repositories)
   - ✅ **write:discussion** (Write team discussions)
   - ✅ **write:packages** (Upload packages)
   - ✅ **read:packages** (Download packages)

4. **Generate and copy the token**:
   - Click "Generate token"
   - **⚠️ Important**: Copy the token immediately as you won't be able to see it again!

### 4. Set Up OpenRouter API Key

1. **Visit OpenRouter**:
   - Go to [OpenRouter](https://openrouter.ai/)
   - Sign up or log in to your account

2. **Get your API key**:
   - Navigate to your account settings/API keys section
   - Create a new API key
   - Copy the API key for use in the next step

### 5. Create Environment File

Create a `.env` file in the root directory of your project and add the following variables:

```env
# OpenRouter API Key for AI assistance
VITE_OPENROUTER_KEY=your_openrouter_api_key_here

# Optional: You can add other environment variables as needed
# VITE_GITHUB_TOKEN=your_github_token_here (Note: For security, it's better to enter this in the app UI)
```

**⚠️ Security Note**: 
- Never commit your `.env` file to version control
- The GitHub token is entered directly in the application UI for better security
- Make sure `.env` is listed in your `.gitignore` file

### 6. Run the Development Server

```bash
npm run dev
```

The application will start and automatically open in your browser at `http://localhost:5173` (or another available port).

## 🔧 Usage

1. **Launch the application** using `npm run dev`

2. **Connect GitHub**:
   - Click on the GitHub integration tile
   - Enter your Personal Access Token in the modal
   - Click "Connect" to establish the connection

3. **Start using AI assistance**:
   - The application will now have access to GitHub operations
   - Use the search/command interface to interact with your repositories
   - Create repositories, issues, and manage your GitHub account through the AI interface

## 📁 Project Structure

```
next-som/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Icons and images
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styles
│   └── vite-env.d.ts      # TypeScript definitions
├── .env                   # Environment variables (create this)
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔍 Troubleshooting

### Common Issues

1. **"API key not found" error**:
   - Ensure your `.env` file is in the root directory
   - Check that `VITE_OPENROUTER_KEY` is correctly set
   - Restart the development server after adding environment variables

2. **GitHub connection fails**:
   - Verify your Personal Access Token has the correct permissions
   - Check that the token hasn't expired
   - Ensure you're entering the token correctly (no extra spaces)

3. **Development server won't start**:
   - Make sure you have Node.js installed
   - Try deleting `node_modules` and running `npm install` again
   - Check if port 5173 is already in use

### Getting Help

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure your GitHub token has the necessary permissions
4. Make sure your OpenRouter API key is valid and has sufficient credits

## 🔒 Security Best Practices

- Never commit your `.env` file to version control
- Regularly rotate your GitHub Personal Access Token
- Use the minimum required permissions for your GitHub token
- Keep your OpenRouter API key secure and monitor usage

## 📄 License

This project is available under the MIT License.