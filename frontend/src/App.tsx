
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BaseLayout from './components/Layout/BaseLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportWizard from './components/ReportFlow/ReportWizard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MapExplorer from './pages/MapExplorer';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<BaseLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route 
                path="report" 
                element={
                  <ProtectedRoute>
                    <ReportWizard />
                  </ProtectedRoute>
                } 
              />
              <Route path="map" element={<MapExplorer />} />
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard isAdminView={false} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
