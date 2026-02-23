// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // 1. Import the Toaster
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      
      {/* 2. Add the Global Toaster with our custom Premium Theme */}
      <Toaster 
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#374151',
            border: '1px solid #eff1ec',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            padding: '16px 24px',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: '600'
          },
          success: {
            iconTheme: { primary: '#556b2f', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;