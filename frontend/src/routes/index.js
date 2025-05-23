import { Suspense, lazy } from "react";
import { Navigate, useRoutes } from "react-router-dom";
// layouts
import MainLayout from "../layouts/main";

// guards
import GuestGuard from "../guards/GuestGuard";
import AuthGuard from "../guards/AuthGuard";

// config
import { PATH_AFTER_LOGIN } from "../config";

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  return (
    <Suspense fallback={<div />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: "auth",
      children: [
        {
          path: "login",
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          ),
        },
        {
          path: "register",
          element: (
            <GuestGuard>
              <Register />
            </GuestGuard>
          ),
        },
      ],
    },

    // Dashboard Routes
    {
      path: "dashboard",
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },

        { path: "roles", element: <Roles /> },
        { path: "users", element: <Users /> },
        { path: "packages", element: <Packages /> },
      ],
    },

    // Main Routes

    {
      path: "/",
      element: <MainLayout />,
      children: [
        { element: <HomePage />, index: true },
        { path: "404", element: <NotFound /> },
      ],
    },
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}

// AUTHENTICATION
const Login = Loadable(lazy(() => import("../pages/auth/Login")));
const Register = Loadable(lazy(() => import("../pages/auth/Register")));
// DASHBOARD
const Roles = Loadable(lazy(() => import("../pages/Roles")));
const Users = Loadable(lazy(() => import("../pages/Users")));
const Packages = Loadable(lazy(() => import("../pages/Packages")));

// MAIN
const HomePage = Loadable(lazy(() => import("../pages/Home")));
const NotFound = Loadable(lazy(() => import("../pages/Page404")));
