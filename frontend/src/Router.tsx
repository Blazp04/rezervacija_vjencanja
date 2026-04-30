import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router"
import { Spinner } from "@/components/Spinner"

const AdminLayout = lazy(() => import("@/routes/App/AppLayout"))

const spinner = (
  <div className="flex min-h-svh items-center justify-center">
    <Spinner />
  </div>
)

function s(el: React.ReactNode) {
  return <Suspense fallback={spinner}>{el}</Suspense>
}

export const router = createBrowserRouter([
  {
    // Redirect root to the admin workspace
    path: "/",
    element: <Navigate to="/admin" replace />,
  },
  {
    path: "/admin/*",
    element: s(<AdminLayout />),
  },
  {
    // Catch-all also lands on admin
    path: "*",
    element: <Navigate to="/admin" replace />,
  },
])
