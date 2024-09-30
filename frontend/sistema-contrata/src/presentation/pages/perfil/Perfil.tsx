import React, { useState, useEffect } from "react";

const PerfilPage: React.FC = () => {
  const [perfil, setPerfil] = useState({
    usuario: "",
    nombres: "",
    apellidos: "",
    dni: "",
    edad: "",
    telefono: "",
    email: ""
  });

  // Simulamos la carga de datos del perfil (puedes cambiar esto para usar una API o Firestore)
  useEffect(() => {
    const userData = {
      usuario: "usuarioEjemplo",
      nombres: "Nombre",
      apellidos: "Apellido",
      dni: "12345678",
      edad: "30",
      telefono: "987654321",
      email: "usuario@ejemplo.com",
    };

    setPerfil(userData);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para actualizar el perfil en Firebase o API
    console.log("Perfil actualizado:", perfil);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-800 text-white rounded-3xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400">Mi Perfil</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Usuario:</label>
          <input
            type="text"
            name="usuario"
            value={perfil.usuario}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Nombres:</label>
          <input
            type="text"
            name="nombres"
            value={perfil.nombres}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Apellidos:</label>
          <input
            type="text"
            name="apellidos"
            value={perfil.apellidos}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">DNI:</label>
          <input
            type="text"
            name="dni"
            value={perfil.dni}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Edad:</label>
          <input
            type="number"
            name="edad"
            value={perfil.edad}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Teléfono:</label>
          <input
            type="text"
            name="telefono"
            value={perfil.telefono}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-white mb-2">Email:</label>
          <input
            type="email"
            name="email"
            value={perfil.email}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all duration-200 ease-in-out"
          >
            Actualizar Perfil
          </button>
        </div>
      </form>
    </div>
  );
};

export default PerfilPage;
