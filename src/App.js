import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ChatRoom from "./components/ChatRoom";
import HomePage from "./pages/HomePage"; // ✅ thêm dòng này

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/home" element={<HomePage />} /> {/* ✅ thêm route mới */}
      </Routes>
    </Router>
  );
}

export default App;
