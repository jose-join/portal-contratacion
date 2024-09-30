import { useState, useEffect } from "react";

const MisPostulacionesPage = () => {
  interface Postulacion {
    id: string;
    nombreConvocatoria: string;  // El título de la convocatoria
    estado: string;
    fechaPostulacion: string;
  }

  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [error, setError] = useState("");

  // Función para obtener las postulaciones
  const fetchPostulaciones = async () => {
    try {
      const token = localStorage.getItem("token"); // Obtener el token desde el localStorage
      const response = await fetch("http://localhost:3000/api/postulante/ver-postulaciones", {
        method: "GET",
        headers: {
          "x-auth-token": token || "", // Enviar el token en la cabecera x-auth-token
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener las postulaciones");
      }

      const data = await response.json();
      setPostulaciones(data.postulaciones); // Guardar las postulaciones en el estado
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  // Hook para obtener las postulaciones al cargar la página
  useEffect(() => {
    fetchPostulaciones();  // Llamada a la función de obtención de postulaciones
  }, []); // Se ejecuta solo una vez cuando se carga el componente

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Mis Postulaciones</h1>
      <p>Aquí puedes ver el estado de tus postulaciones.</p>

      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full mt-4 bg-gray-800 text-white rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700">Convocatoria</th>
            <th className="py-2 px-4 border-b border-gray-700">Estado</th>
            <th className="py-2 px-4 border-b border-gray-700">Fecha Postulación</th>
          </tr>
        </thead>
        <tbody>
          {postulaciones.length > 0 ? (
            postulaciones.map((postulacion, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b border-gray-700">{postulacion.nombreConvocatoria}</td>
                <td className="py-2 px-4 border-b border-gray-700">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-bold ${getBadgeColor(postulacion.estado)}`}
                  >
                    {postulacion.estado}
                  </span>
                </td>
                <td className="py-2 px-4 border-b border-gray-700">
                  {new Date(postulacion.fechaPostulacion).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center py-4">
                No tienes postulaciones registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Función para asignar colores según el estado de la postulación
const getBadgeColor = (estado: string) => {
  switch (estado) {
    case "aprobado":
      return "bg-green-500 text-white";
    case "rechazado":
      return "bg-red-500 text-white";
    case "en proceso":
      return "bg-yellow-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export default MisPostulacionesPage;
