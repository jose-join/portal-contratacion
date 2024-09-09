import { Navigate, createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import ConvocatoriasPage from "../pages/convocatorias/Convocatorias";
import PostulantesPage from "../pages/postulantes/Postulantes";
import DocumentosPage from "../pages/documentos/Documentos";
import BlockchainPage from "../pages/blockchain/Blockchain";

export const menuRoutes = [
  {
    to: "/convocatorias",
    icon: "fa-solid fa-clipboard-list",
    title: "Convocatorias",
    description: "Gestión de convocatorias",
    component: <ConvocatoriasPage />,
  },
  {
    to: "/postulantes",
    icon: "fa-solid fa-users",
    title: "Postulantes",
    description: "Gestión de postulantes",
    component: <PostulantesPage />,
  },
  {
    to: "/documentos",
    icon: "fa-solid fa-file-alt",
    title: "Documentos",
    description: "Gestión de documentos",
    component: <DocumentosPage />,
  },
  {
    to: "/blockchain",
    icon: "fa-solid fa-link",
    title: "Blockchain",
    description: "Estado de la blockchain",
    component: <BlockchainPage />,
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      ...menuRoutes.map((route) => ({
        path: route.to,
        element: route.component,
      })),
      {
        path: "",
        element: <Navigate to={menuRoutes[0].to} />,
      },
    ],
  },
]);
