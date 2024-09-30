import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    usuario: "",
    nombres: "",
    apellidos: "",
    dni: "",
    edad: "",
    telefono: ""
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/auth/registerPostulante", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Postulante registrado correctamente");
        navigate("/login"); // Redirigir al login tras el registro
      } else {
        setMessage(data.message || "Error en el registro");
      }
    } catch (error) {
      setMessage("Error en el servidor");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white bg-opacity-10 p-8 rounded-3xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-green-400 mb-6">Registro de Postulante</h1>
        <form className="space-y-6" onSubmit={handleRegister}>
          {/* Campos del formulario */}
          {["email", "password", "usuario", "nombres", "apellidos", "dni", "edad", "telefono"].map((field, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-white mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
              <input
                type={field === "password" ? "password" : "text"}
                name={field}
                value={formData[field as keyof typeof formData]}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-gray-900 text-white border border-gray-700"
                placeholder={`Ingrese su ${field}`}
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-all duration-200"
          >
            Registrarse
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center">
            <p className="text-lg font-bold text-white">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
