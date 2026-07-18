# 🌌 Typeverse - The Ultimate Typing Experience

![Typeverse Hero](frontend/src/assets/hero.png)

Typeverse is a next-generation multiplayer typing game that features real-time races against friends, global leaderboards, detailed analytics, and an intelligent **Ghost AI Typing Coach** powered by Google Gemini.

Whether you want to race your friends or practice against an adaptive AI that learns your weaknesses, Typeverse provides a sleek, modern, and highly responsive environment to improve your typing speed.

---

## ✨ Features

- **🤖 Ghost AI Typing Coach**: Race against an adaptive AI that matches your speed. After the race, Gemini AI analyzes your mistakes and generates a custom practice paragraph targeting the exact keys you missed.
- **🏎️ Real-Time Multiplayer**: Create custom rooms and race against friends with zero latency using WebSocket technology.
- **📊 Advanced Analytics**: Track your WPM, accuracy, and consistency with detailed, interactive charts and match history.
- **🏆 Global Leaderboards**: Compete for the top spot on the Hall of Fame.
- **🎨 Beautiful UI & Theming**: Built with Tailwind CSS, featuring full Light/Dark mode support, glassmorphism, and buttery smooth animations.
- **🔒 Secure Authentication**: JWT-based email/password authentication alongside Google OAuth integration.

---

## 📸 Screenshots

### Home Page & Landing
![Home Page](frontend/src/assets/Screenshot%202026-07-18%20150900.png)

### Authentication
![Login / Auth](frontend/src/assets/Screenshot%202026-07-18%20150934.png)

### Dashboard & Analytics
![Dashboard](frontend/src/assets/Screenshot%202026-07-18%20151011.png)

### All App Screenshots

![Screenshot 1](frontend/src/assets/Screenshot%202026-07-18%20150900.png)
![Screenshot 2](frontend/src/assets/Screenshot%202026-07-18%20150934.png)
![Screenshot 3](frontend/src/assets/Screenshot%202026-07-18%20151011.png)
![Screenshot 4](frontend/src/assets/Screenshot%202026-07-18%20151031.png)
![Screenshot 5](frontend/src/assets/Screenshot%202026-07-18%20151043.png)
![Screenshot 6](frontend/src/assets/Screenshot%202026-07-18%20151056.png)
![Screenshot 7](frontend/src/assets/Screenshot%202026-07-18%20151350.png)
![Screenshot 8](frontend/src/assets/Screenshot%202026-07-18%20151410.png)
![Screenshot 9](frontend/src/assets/Screenshot%202026-07-18%20151428.png)
![Screenshot 10](frontend/src/assets/Screenshot%202026-07-18%20151515.png)
![Screenshot 11](frontend/src/assets/Screenshot%202026-07-18%20151523.png)
![Screenshot 12](frontend/src/assets/Screenshot%202026-07-18%20151541.png)
![Screenshot 13](frontend/src/assets/Screenshot%202026-07-18%20151557.png)
![Screenshot 14](frontend/src/assets/Screenshot%202026-07-18%20151620.png)
![Screenshot 15](frontend/src/assets/Screenshot%202026-07-18%20151707.png)
![Screenshot 16](frontend/src/assets/Screenshot%202026-07-18%20151720.png)
![Screenshot 17](frontend/src/assets/Screenshot%202026-07-18%20151734.png)
![Screenshot 18](frontend/src/assets/Screenshot%202026-07-18%20151855.png)
![Screenshot 19](frontend/src/assets/Screenshot%202026-07-18%20151944.png)
![Screenshot 20](frontend/src/assets/Screenshot%202026-07-18%20152002.png)
![Screenshot 21](frontend/src/assets/Screenshot%202026-07-18%20152014.png)
![Screenshot 22](frontend/src/assets/Screenshot%202026-07-18%20152039.png)
![Screenshot 23](frontend/src/assets/Screenshot%202026-07-18%20152101.png)
![Screenshot 24](frontend/src/assets/Screenshot%202026-07-18%20152117.png)
![Screenshot 25](frontend/src/assets/Screenshot%202026-07-18%20152213.png)

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- React Router DOM
- Socket.IO Client
- Lucide React (Icons)
- Recharts (Analytics)

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- Socket.IO (WebSockets)
- Google Gen AI SDK (Gemini)
- JWT & bcryptjs

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI
- Google Gemini API Key

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/yourusername/typeverse.git
cd typeverse
\`\`\`

### 2. Setup Backend
\`\`\`bash
cd backend
npm install
\`\`\`

Create a `.env` file in the `backend` directory:
\`\`\`env
PORT=5000
MONGO_URI=mongodb://localhost:27017/typewithme
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
\`\`\`

Start the backend development server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Setup Frontend
\`\`\`bash
cd ../frontend
npm install
\`\`\`

Create a `.env` file in the `frontend` directory:
\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
\`\`\`

Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

---

## 🎮 How to Play
1. **Create an Account**: Sign up using email or Google Auth.
2. **Start a Practice Race**: Warm up your fingers in solo mode.
3. **Race the AI**: Head to the "Ghost AI Race" to get personalized coaching and dynamic text generation based on your chosen topic.
4. **Challenge Friends**: Click "Multiplayer", create a room, and share the Room ID with your friends to race in real-time.

---

## 📝 License
This project is licensed under the MIT License.
