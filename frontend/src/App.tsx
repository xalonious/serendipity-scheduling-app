import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import LandingPage from "./pages/landingpage";
import TrainingPage from "./pages/TrainingPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQPage from "./pages/FAQPage";
import NotFound from "./pages/notfound";
import ShiftsPage from "./pages/ShiftsPage";

const AppRoutes: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);

    if (params.get("logoutSuccess") === "1") {
      toast.info("Logged out successfully");
      params.delete("logoutSuccess");
    }
    if (params.get("loginError") === "staff_only") {
      toast.error("Login is only for staff members");
      params.delete("loginError");
    }
    if(params.get("loginError") === "access_denied") {
      toast.error("Login failed. Please try again.");
      params.delete("loginError");
    }
    if (params.get("loginSuccess") === "1") {
      toast.success("Logged in successfully");
      params.delete("loginSuccess");
    }

    const newSearch = params.toString();
    window.history.replaceState(
      {},
      "",
      pathname + (newSearch ? `?${newSearch}` : "")
    );
  }, [pathname, search]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/trainings" element={<TrainingPage />} />
      <Route path="/shifts" element={<ShiftsPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;