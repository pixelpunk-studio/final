import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import AdminPanel from "./components/admin/AdminPanel";
import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import Services from "./components/landing/Services";
import Portfolio from "./components/landing/Portfolio";
import Pricing from "./components/landing/Pricing";
import Reviews from "./components/landing/Reviews";
import Contact from "./components/landing/Contact";
import Footer from "./components/landing/Footer";
import SEO from "./components/SEO";

function AuthenticatedApp() {
  const { currentUser, loading } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (window.location.pathname === "/admin") {
    if (!currentUser) {
      return showForgotPassword ? (
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      ) : (
        <Login onForgotPassword={() => setShowForgotPassword(true)} />
      );
    }
    return <AdminPanel />;
  }

  return (
    <>
      <SEO />
      <Navbar />
      <Hero />
      <Features />
      <Services />
      <Portfolio />
      <Pricing />
      <Reviews />
      <Contact />
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
