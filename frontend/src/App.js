// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import PolicyPlayground from "./pages/PolicyPlayground";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <Header />
      <main style={{ minHeight: "80vh" }}>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Reports:
              - /reports → redirect to default (income)
              - /reports/:topic → render that report (income, health, etc.) */}
          <Route path="/reports" element={<Navigate to="/reports/income" replace />} />
          <Route path="/reports/:topic" element={<Reports />} />

          {/* Other pages */}
          <Route path="/policy-playground" element={<PolicyPlayground />} />
          <Route path="/about" element={<About />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
