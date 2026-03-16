// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ReportIssue from "./pages/ReportIssue";
import IssuesMap from "./pages/IssuesMap";
import IssuesList from "./pages/IssuesList";
import Login from "./pages/Login";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/map" element={<IssuesMap />} />
          <Route path="/issues" element={<IssuesList />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>

      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#05160e',
            color: '#fff',
            border: '1px solid #143324',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}

export default App;
