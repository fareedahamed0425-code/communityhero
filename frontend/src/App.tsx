
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BaseLayout from './components/Layout/BaseLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import ReportWizard from './components/ReportFlow/ReportWizard';
import Login from './pages/Login';
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
              <Route path="report" element={<ReportWizard />} />
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
                    <Dashboard isAdminView={true} />
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
