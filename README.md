# AI Club Security Tools

An interactive web application designed for AI Club events, featuring password generation, strength analysis, and brute force simulation tools.

## 🚀 Features

### Page 1: Password Generator & Strength Checker
- **Customizable Password Generation**
  - Adjustable length (4-32 characters)
  - Character type selection (uppercase, lowercase, numbers, symbols)
  - Real-time generation with smooth animations
  - One-click copy to clipboard

- **Advanced Strength Analysis**
  - Color-coded strength meter (weak/fair/good/strong)
  - Entropy calculation in bits
  - Time-to-crack estimation
  - Specific improvement suggestions
  - Pattern detection (repeated chars, sequences, common words)

### Page 2: Brute Force Simulation
- **Interactive Attack Simulation**
  - Three attack methods: Brute Force, Dictionary Attack, Smart Attack
  - Adjustable simulation speed (0.1x to 10x)
  - Real-time attempt counter and progress visualization
  - Character-by-character attempt display

- **Comprehensive Security Analysis**
  - Attack resistance comparison across different methods
  - Time-to-crack calculations for each attack type
  - Educational insights about attack vectors
  - Interactive challenges for learning

## 🛠️ Technology Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 with custom animations
- **Language**: TypeScript
- **Fonts**: Geist Sans & Geist Mono
- **Features**: Dark mode support, responsive design, glassmorphism effects

## 🎯 Educational Value

This project is designed to teach password security concepts through hands-on interaction:

- **Entropy Understanding**: Learn how password complexity affects security
- **Attack Methods**: Understand different types of password attacks
- **Time Complexity**: See how password length exponentially increases security
- **Best Practices**: Get specific recommendations for creating secure passwords

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Password Generator
1. Adjust the length slider and character type checkboxes
2. Click "Generate Password" to create a new password
3. View real-time strength analysis and suggestions
4. Copy the generated password to your clipboard

### Brute Force Simulator
1. Enter a password to test
2. Select an attack method (Brute Force, Dictionary, or Smart Attack)
3. Adjust the simulation speed
4. Click "Start Simulation" to see the attack in action
5. View detailed security analysis and recommendations

## 🎨 Design Features

- **Modern UI**: Glassmorphism effects with backdrop blur
- **Smooth Animations**: Fade-in effects, hover animations, and transitions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Automatic dark mode support based on system preference
- **Accessibility**: Keyboard navigation and screen reader support

## 🔧 Customization

The application is built with modularity in mind:

- **Components**: Reusable React components in `/app/components/`
- **Utilities**: Password and security calculation logic in `/app/utils/`
- **Styling**: Custom CSS animations and Tailwind configuration
- **Pages**: Separate routes for different features

## 📚 Educational Resources

The app includes built-in educational content:

- Password security best practices
- Explanation of entropy and complexity
- Attack method descriptions
- Interactive challenges for learning
- Real-world security considerations

## 🤝 Contributing

This project was created for AI Club educational purposes. Feel free to:

- Add new attack methods
- Implement additional password patterns
- Enhance the educational content
- Improve the UI/UX design
- Add new security features

## 📄 License

This project is created for educational purposes as part of AI Club activities.
