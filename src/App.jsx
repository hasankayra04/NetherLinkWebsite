import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from './page/Home';
import Terms from './page/Terms';
import Privacy from './page/Privacy';
import Contact from "./page/Contact";
import Info from "./page/Info"; 

export default function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/info" element={<Info />} /> 
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
  );
}