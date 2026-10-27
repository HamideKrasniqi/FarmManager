import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import MarketingLayout from './components/MarketingLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeaturesPage from './pages/FeaturesPage';
import ModulesPage from './pages/ModulesPage';
import RolesPage from './pages/RolesPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import AnimalsPage from './pages/AnimalsPage';
import CropsPage from './pages/CropsPage';
import FinancesPage from './pages/FinancesPage';
import TasksPage from './pages/TasksPage';
import EmployeesPage from './pages/EmployeesPage';
import SalaryPage from './pages/SalaryPage';
import VacationsPage from './pages/VacationsPage';
import { FarmsAdminPage } from './pages/SuperAdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<MarketingLayout />}>
            <Route path="features" element={<FeaturesPage />} />
            <Route path="modules" element={<ModulesPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="pricing" element={<PricingPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />

              <Route element={<ProtectedRoute roles={['OWNER', 'MANAGER']} />}>
                <Route path="animals" element={<AnimalsPage />} />
                <Route path="crops" element={<CropsPage />} />
                <Route path="tasks" element={<TasksPage />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute roles={['OWNER', 'MANAGER', 'WORKER']} />
                }
              >
                <Route path="vacations" element={<VacationsPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['OWNER', 'WORKER']} />}>
                <Route path="salaries" element={<SalaryPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['OWNER']} />}>
                <Route path="finances" element={<FinancesPage />} />
                <Route path="employees" element={<EmployeesPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['SUPERADMIN']} />}>
                <Route path="admin/farms" element={<FarmsAdminPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
