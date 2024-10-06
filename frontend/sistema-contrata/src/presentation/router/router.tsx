import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import ConvocatoriasPage from "../pages/convocatorias/Convocatorias";
import BlockchainPage from "../pages/blockchain/Blockchain";
import LoginPage from "../pages/login/Login";
import PerfilPage from "../pages/perfil/Perfil";
import MisPostulacionesPage from "../pages/misPostulaciones/MisPostulaciones";
import ConvocatoriaPostulante from "../pages/convocatoriaPostulante/ConvocatoriaPostulante";
import RegisterPage from "../pages/register/RegisterPage";
import AdministrarConvocatoriasPage from "../pages/convocatoriasAdmin/ConvocatoriasAdmin"; // Import the missing component
import MisDocumentos from "../pages/misDocumentos/MisDocumentos";
import { PrivateRoute } from "./PrivateRoute";

// Rutas para el administrador
export const adminMenuRoutes = [
  {
    to: "/convocatorias",
    icon: "fa-solid fa-clipboard-list",
    title: "Convocatorias",
    description: "Gestión de convocatorias",
    component: <ConvocatoriasPage />,
  },
  {
    to: "/administrar-convocatorias", // Nueva ruta
    icon: "fa-solid fa-cogs",
    title: "Administrar Convocatorias",
    description: "Gestionar estados y subir a blockchain",
    component: <AdministrarConvocatoriasPage />, // El nuevo componente que acabamos de crear
  },
  {
    to: "/blockchain",
    icon: "fa-solid fa-link",
    title: "Blockchain",
    description: "Estado de la blockchain",
    component: <BlockchainPage />,
  },
];

// Rutas para el postulante
export const postulanteMenuRoutes = [
  {
    to: "/convocatorias-postulante",
    icon: "fa-solid fa-clipboard-list",
    title: "Convocatorias",
    description: "Ver convocatorias subidas a la blockchain",
    component: <ConvocatoriaPostulante />, // Nueva página de convocatorias para el postulante
  },
  {
    to: "/perfil",
    icon: "fa-solid fa-user",
    title: "Perfil",
    description: "Gestionar perfil",
    component: <PerfilPage />,
  },
  {
    to: "/mis-postulaciones",
    icon: "fa-solid fa-file-signature",
    title: "Mis Postulaciones",
    description: "Ver el estado de tus postulaciones",
    component: <MisPostulacionesPage />,
  },
  {
    to: "/mis-documentos", // Nueva ruta para la página de subir documentos
    icon: "fa-solid fa-folder-open",
    title: "Mis Documentos",
    description: "Subir y gestionar tus documentos",
    component: <MisDocumentos />, // El componente MisDocumentos que acabamos de crear
  },
];

const router = createBrowserRouter([
  {
    path: "/", // Ruta protegida para el dashboard
    element: <PrivateRoute component={DashboardLayout} />, // Protegemos el DashboardLayout
    children: [
      ...adminMenuRoutes.map((route) => ({
        path: route.to,
        element: route.component,
      })),
      ...postulanteMenuRoutes.map((route) => ({
        path: route.to,
        element: route.component,
      })),
    ],
  },
  {
    path: "/login", // Ruta de login pública
    element: <LoginPage />,
  },
  {
    path: "/registro", // Nueva ruta para registro de postulantes
    element: <RegisterPage />, // Página de registro
  },
]);


export default router;