import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NewAnalysis from "./pages/NewAnalysis";
import AnalysisDetails from "./pages/AnalysisDetails";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/new-analysis"
        element={
          <ProtectedRoute>
            <NewAnalysis />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analysis/:id"
        element={
          <ProtectedRoute>
            <AnalysisDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
