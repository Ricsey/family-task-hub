import { Outlet } from "react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";

const AuthLayout = () => {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
};

export default AuthLayout;
