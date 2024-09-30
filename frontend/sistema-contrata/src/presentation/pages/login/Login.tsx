import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Hook para redirigir

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role); // Guarda el rol en localStorage

        if (data.role === "admin") {
          setMessage("Te has logueado como Administrador. Redirigiendo al Dashboard de Administrador...");
          navigate("/convocatorias"); // Redirigir a convocatorias o cualquier otra ruta existente
        } else if (data.role === "postulante") {
          setMessage("Te has logueado como Postulante. Redirigiendo al Dashboard de Postulante...");
          navigate("/convocatorias"); // Redirigir a la ruta para postulantes
        }
      } else {
        setMessage(data.message || "Error en el inicio de sesión");
      }
    } catch (error) {
      setMessage("Error en el servidor");
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/registro"); // Redirigir a la página de registro
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white bg-opacity-10 p-8 rounded-3xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-400 mb-6">Iniciar Sesión</h1>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Usuario:</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-900 text-white border border-gray-700"
              placeholder="Ingrese su correo"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Contraseña:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-900 text-white border border-gray-700"
              placeholder="Ingrese su contraseña"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all duration-200"
          >
            Ingresar
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center">
            <p className="text-lg font-bold text-white">{message}</p>
          </div>
        )}

        {/* Agregar botón para registro de postulante */}
        <div className="mt-6 text-center">
          <button 
            onClick={handleRegisterRedirect} 
            className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-all duration-200"
          >
            Registrarse como Postulante
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
