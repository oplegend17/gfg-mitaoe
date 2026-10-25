import { Routes, Route, Navigate } from "react-router-dom";
import Student from "./pages/Student.jsx";
import Admin from "./pages/Admin.jsx";
import QRPage from "./pages/QRPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Student />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/qr" element={<QRPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
