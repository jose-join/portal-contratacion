import { Outlet, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

// Variable global para manejar los listeners de Firestore (si aplica)
let unsubscribeFirestoreListener: () => void;

const PostulanteDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem("token");

  // Si no está autenticado, redirigir al login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Manejar el cierre de sesión
  const handleLogout = () => {
    // Cerrar listeners activos de Firestore
    cerrarFirestoreListener();

    // Eliminar el token de autenticación
    localStorage.removeItem("token");

    // Redirigir al login
    navigate("/login");
  };

  // Función para cerrar los listeners de Firestore
  const cerrarFirestoreListener = () => {
    if (unsubscribeFirestoreListener) {
      unsubscribeFirestoreListener(); // Detener cualquier listener activo de Firestore
    }
  };

  return (
    <main className="flex flex-row mt-7">
      {/* Barra lateral */}
      <nav className="hidden sm:flex flex-col ml-5 w-[370px] min-h-[calc(100vh-3.0rem)] bg-white bg-opacity-10 p-5 rounded-3xl">
        <h1 className="font-bold text-lg lg:text-3xl bg-gradient-to-br from-white via-white/50 bg-clip-text text-transparent">
          Portal de Postulante<span className="text-indigo-500">.</span>
        </h1>
        <span className="text-xl">Bienvenido, Postulante</span>

        <div className="border-gray-700 border my-3" />

        {/* Opciones del menú */}
        <ul>
          <li className="mb-3">
            <button
              className="text-white text-lg font-semibold hover:bg-indigo-500 p-2 rounded-md w-full"
              onClick={() => navigate("/postulante/convocatorias")}
            >
              Ver Convocatorias
            </button>
          </li>
          <li className="mb-3">
            <button
              className="text-white text-lg font-semibold hover:bg-indigo-500 p-2 rounded-md w-full"
              onClick={() => navigate("/postulante/postulaciones")}
            >
              Estado de Postulaciones
            </button>
          </li>
          <li className="mb-3">
            <button
              className="text-white text-lg font-semibold hover:bg-indigo-500 p-2 rounded-md w-full"
              onClick={() => navigate("/postulante/perfil")}
            >
              Perfil
            </button>
          </li>
        </ul>

        {/* Botón de cerrar sesión */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center p-2 text-white text-lg font-semibold hover:bg-red-600 bg-red-500 rounded-md"
        >
          <i className="fa-solid fa-sign-out-alt mr-3"></i>
          Cerrar sesión
        </button>
      </nav>

      {/* Sección principal */}
      <section className="mx-3 sm:mx-20 flex flex-col w-full h-[calc(100vh-50px)] bg-white bg-opacity-10 p-5 rounded-3xl">
        <div className="flex flex-row h-full">
          <div className="flex flex-col flex-auto h-full p-1">
            <Outlet /> {/* Aquí se cargarán las diferentes vistas */}
          </div>
        </div>
      </section>
    </main>
  );
};

export default PostulanteDashboard;
