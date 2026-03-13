import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from './page/Home';
import Terms from './page/Terms';
import Privacy from './page/Privacy';
import Contact from "./page/Contact";
import Info from "./page/Info"; 
import FeaturedSlot from "./page/FeaturedSlot";
import Navbar from "./Navbar";
import Footer from "./Footer";

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/info" element={<Info />} /> 
        <Route path="/contact" element={<Contact />} />
        <Route path="/slot" element={<FeaturedSlot />} />
      </Routes>
      <Footer />
    </Router>
  );
}