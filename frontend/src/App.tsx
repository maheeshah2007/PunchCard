import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Welcome    from "./pages/Welcome";
import Auth       from "./pages/Auth";
import RoleSelect from "./pages/RoleSelect";

import UserDashboard        from "./user/Dashboard";
import UserWallet           from "./user/Wallet";
import UserBrowse           from "./user/Browse";
import UserProfile          from "./user/Profile";
import BusinessDetail       from "./user/BusinessDetail";
import AuthenticatePurchase from "./user/AuthenticatePurchase";

import BusinessSetup        from "./business/Setup";
import BusinessDashboard    from "./business/Dashboard";
import CreatePunchcard      from "./business/CreatePunchcard";
import GenerateCode         from "./business/GenerateCode";
import BusinessCustomers    from "./business/Customers";
import BusinessProfile      from "./business/Profile";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (!user.role) return <Navigate to="/role-select" replace />;
  if (user.role === "business") return <Navigate to="/business/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Welcome />} />
        <Route path="/login"    element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/role-select" element={<RoleSelect />} />
        <Route path="/home"     element={<HomeRedirect />} />

        <Route path="/dashboard"      element={<UserDashboard />} />
        <Route path="/wallet"         element={<UserWallet />} />
        <Route path="/browse"         element={<UserBrowse />} />
        <Route path="/profile"        element={<UserProfile />} />
        <Route path="/businesses/:id" element={<BusinessDetail />} />
        <Route path="/authenticate"   element={<AuthenticatePurchase />} />

        <Route path="/business/setup"            element={<BusinessSetup />} />
        <Route path="/business/dashboard"        element={<BusinessDashboard />} />
        <Route path="/business/punchcard/create" element={<CreatePunchcard />} />
        <Route path="/business/generate-code"    element={<GenerateCode />} />
        <Route path="/business/customers"        element={<BusinessCustomers />} />
        <Route path="/business/profile"          element={<BusinessProfile />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
