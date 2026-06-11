// src/App.jsx
import { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { Toaster } from "react-hot-toast";
import { auth } from "./firebase";

// Lazy load every page for <4s load time via code splitting
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const PagePlaceholder = lazy(() => import("./pages/PagePlaceholder"));

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      <span className="text-brand-700 text-xs font-bold tracking-widest uppercase">KARVEX</span>
    </div>
  </div>
);

function App() {
  const [user, authLoading] = useAuthState(auth);

  const ProtectedRoute = ({ element }) => {
    if (authLoading) return <PageLoader />;
    return user ? element : <Navigate to="/login" replace />;
  };
  ProtectedRoute.propTypes = { element: PropTypes.element.isRequired };

  const PublicRoute = ({ element }) => {
    if (authLoading) return <PageLoader />;
    return user ? <Navigate to="/home" replace /> : element;
  };
  PublicRoute.propTypes = { element: PropTypes.element.isRequired };

  return (
    <Router>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#374151",
            border: "1px solid #eff1ec",
            borderRadius: "16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            padding: "16px 24px",
            fontFamily: "inherit",
            fontSize: "14px",
            fontWeight: "600",
          },
          success: { iconTheme: { primary: "#4338ca", secondary: "#ffffff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#ffffff" } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute element={<Login />} />} />

          {/* FEATURE ROUTES */}
          <Route
            path="/ats-score"
            element={
              <PagePlaceholder
                title="ATS Resume Scorer"
                description="A smart resume scoring experience is on its way. Keep an eye out for line-by-line fixes that help your resume pass recruiter filters."
              />
            }
          />
          <Route
            path="/jobs"
            element={
              <PagePlaceholder
                title="Smart Job Board"
                description="This hub will soon connect you with hand-picked roles and recruiter-ready applications."
              />
            }
          />
          <Route
            path="/learn"
            element={
              <PagePlaceholder
                title="Career Roadmaps"
                description="Learning paths and guides are being prepared to help you level up quickly."
              />
            }
          />
          <Route
            path="/student/dsa"
            element={
              <PagePlaceholder
                title="DSA, SQL, Aptitude Practice"
                description="Practice modules are coming soon to train your coding and aptitude skills for real interview pipelines."
              />
            }
          />
          <Route
            path="/companies"
            element={
              <PagePlaceholder
                title="Company Explorer"
                description="A research tool for recruiter hiring data, salaries, and interview loops is under development."
              />
            }
          />
          <Route
            path="/opensource"
            element={
              <PagePlaceholder
                title="Open Source & GSoC"
                description="Mentor-approved open source opportunities and GSoC resources are being prepared."
              />
            }
          />

          {/* NAVIGATION ROUTES */}
          <Route path="/onboarding" element={<ProtectedRoute element={<Onboarding />} />} />
          <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />

          {/* FOOTER ROUTES */}
          <Route
            path="/terms"
            element={
              <PagePlaceholder
                title="Terms of Service"
                description="Read the KARVEX terms governing your use of the platform."
              />
            }
          />
          <Route
            path="/privacy"
            element={
              <PagePlaceholder
                title="Privacy Policy"
                description="Learn how KARVEX protects your data and how information is handled."
              />
            }
          />
          <Route
            path="/refund"
            element={
              <PagePlaceholder
                title="Refund Policy"
                description="Our refund policy details eligibility and process for subscription refunds."
              />
            }
          />
          <Route
            path="/shipping"
            element={
              <PagePlaceholder
                title="Shipping Policy"
                description="This page explains shipping and delivery terms for any physical products or services."
              />
            }
          />
          <Route
            path="/contact"
            element={
              <PagePlaceholder
                title="Contact KARVEX"
                description="Reach out for support, feedback, or partnership inquiries at hello@karvex.io."
              />
            }
          />

          {/* FALLBACK */}
          <Route
            path="*"
            element={
              <PagePlaceholder
                title="Page not found"
                description="The address you tried doesn't exist yet. Use the button below to return to the home page."
                ctaText="Go home"
              />
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;