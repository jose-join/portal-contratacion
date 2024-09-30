import { Outlet, useNavigate } from "react-router-dom";
import { SidebarMenuitem } from '../components/index';
import { adminMenuRoutes, postulanteMenuRoutes } from '../router/router'; // Importamos ambos menús

// Función para obtener el rol del usuario
const getUserRole = (): string => {
  return localStorage.getItem('role') || 'postulante'; // Puede ser 'admin' o 'postulante'
};

const DashboardLayout = () => {
  const userRole = getUserRole(); // Obtenemos el rol del usuario
  const navigate = useNavigate(); // Para redirigir al login tras cerrar sesión

  // Seleccionamos el menú dependiendo del rol
  const menuRoutes = userRole === 'admin' ? adminMenuRoutes : postulanteMenuRoutes;

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate("/login"); // Redirigir al login después de cerrar sesión
  };

  return (
    <main className="flex flex-row mt-7">
      <nav className="hidden sm:flex flex-col ml-5 w-[370px] min-h-[calc(100vh-3.0rem)] bg-white bg-opacity-10 p-5 rounded-3xl">
        <h1 className="font-bold text-lg lg:text-3xl bg-gradient-to-br from-white via-white/50 bg-clip-text text-transparent">
          Portal de Contratación<span className="text-indigo-500">.</span>
        </h1>
        <span className="text-xl">Bienvenido</span>

        <div className="border-gray-700 border my-3" />

        {/* Opciones del menú */}
        {
          menuRoutes.map(option => (
            <SidebarMenuitem key={option.to} {...option} />
          ))
        }

        {/* Botón de cerrar sesión */}
        <div className="mt-auto"> {/* Para colocar el botón en la parte inferior */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-700 transition-all duration-200 ease-in-out"
          >
            Cerrar Sesión
          </button>
        </div>
        
      </nav>

      <section className="mx-3 sm:mx-20 flex flex-col w-full h-[calc(100vh-50px)] bg-white bg-opacity-10 p-5 rounded-3xl">
        <div className="flex flex-row h-full">
          <div className="flex flex-col flex-auto h-full p-1">
            <Outlet />
          </div>
        </div>
      </section>
    </main>
  )
}

export default DashboardLayout;
