import { useState, useEffect } from "react";

const ConvocatoriasAdminPage = () => {
  interface Convocatoria {
    id: string;
    titulo: string;
    numeroDePostulantes: number;
    estado: "proceso" | "evaluacion" | "publicacion";
    subidoBlockchain: boolean;
  }

  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [error, setError] = useState("");

  // Obtener el token del localStorage o de tu sistema de autenticación
  const token = localStorage.getItem("token");

  // Función para obtener las convocatorias
  useEffect(() => {
    const fetchConvocatorias = async () => {
      try {
        const token = localStorage.getItem("token") || "";

        const response = await fetch("http://localhost:3000/api/convocatoria", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("No autorizado. Por favor, inicie sesión.");
          } else {
            throw new Error("Error al obtener las convocatorias");
          }
        }

        const data = await response.json();

        // Filtrar solo las convocatorias subidas a la blockchain
        const convocatoriasSubidas = data.filter(
          (convocatoria: Convocatoria) => convocatoria.subidoBlockchain
        );

        // Verificar que la API devuelve los campos correctos
        const convocatoriasConPostulantes = await Promise.all(
          convocatoriasSubidas.map(async (convocatoria: any) => {
            const postulantesResponse = await fetch(
              `http://localhost:3000/api/convocatoria/postulantes/${convocatoria.id}`,
              {
                headers: {
                  "x-auth-token": token,
                },
              }
            );
            const postulantesData = await postulantesResponse.json();

            return {
              ...convocatoria,
              numeroDePostulantes: postulantesData.numeroPostulantes,
              estado: convocatoria.estado || "proceso", // Asignar un valor predeterminado si el estado no está definido
            };
          })
        );

        setConvocatorias(convocatoriasConPostulantes);
      } catch (error) {
        setError((error as Error).message || "Error desconocido");
      }
    };

    if (token) {
      fetchConvocatorias();
    } else {
      setError("No autorizado. Por favor, inicie sesión.");
    }
  }, [token]);

  const subirABlockchain = async (idConvocatoria: string) => {
    try {
      console.log(`Subiendo convocatoria con ID: ${idConvocatoria} a la blockchain`);
      const response = await fetch(`http://localhost:3000/api/convocatoria/blockchain-postulantes/${idConvocatoria}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",  // Asegúrate de que el token esté correctamente almacenado
        },
      });

      if (!response.ok) {
        throw new Error("Error al subir la convocatoria a la blockchain");
      }

      const data = await response.json();
      console.log("Convocatoria subida con éxito:", data);

      // Actualizar el estado local para reflejar los cambios en el frontend
      setConvocatorias(convocatorias.map(convocatoria =>
        convocatoria.id === idConvocatoria ? { ...convocatoria, estado: "evaluacion" } : convocatoria
      ));
    } catch (error) {
      console.error(error);
      setError("Error al subir la convocatoria a la blockchain o al actualizar el estado");
    }
  };

  // Función para actualizar el estado de la convocatoria
  const actualizarEstado = async (id: string, nuevoEstado: "evaluacion" | "publicacion") => {
    try {
      const response = await fetch(`http://localhost:3000/api/convocatoria/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify({ estado: nuevoEstado }), // Enviar el nuevo estado
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de la convocatoria");
      }

      // Actualizar el estado localmente
      setConvocatorias(convocatorias.map(convocatoria =>
        convocatoria.id === id ? { ...convocatoria, estado: nuevoEstado } : convocatoria
      ));
    } catch (error) {
      setError("Error al actualizar el estado");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Gestión de Convocatorias</h1>
      <p className="text-gray-400 mb-4">
        Revisa y administra las convocatorias subidas a la blockchain.
      </p>

      {error && <p className="text-red-500 text-lg font-semibold">{error}</p>}

      <h2 className="text-2xl font-bold mb-4 text-white">Lista de Convocatorias</h2>

      <table className="w-full bg-gray-900 text-white rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-800">
            <th className="py-3 px-4 border-b border-gray-700 text-left">Convocatoria</th>
            <th className="py-3 px-4 border-b border-gray-700 text-left">Postulantes</th>
            <th className="py-3 px-4 border-b border-gray-700 text-left">Estado</th>
            <th className="py-3 px-4 border-b border-gray-700 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {convocatorias.length > 0 ? (
            convocatorias.map((convocatoria, index) => (
              <tr key={index} className="hover:bg-gray-800">
                <td className="py-3 px-4 border-b border-gray-700">{convocatoria.titulo}</td>
                <td className="py-3 px-4 border-b border-gray-700">{convocatoria.numeroDePostulantes}</td>
                <td className="py-3 px-4 border-b border-gray-700">
                  <span
                    className={`px-3 py-1 rounded-full font-semibold ${
                      convocatoria.estado === "proceso"
                        ? "bg-yellow-500 text-black"
                        : convocatoria.estado === "evaluacion"
                        ? "bg-green-500 text-white"
                        : convocatoria.estado === "publicacion"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {convocatoria.estado}
                  </span>
                </td>
                <td className="py-3 px-4 border-b border-gray-700">
                  <button
                    className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-full hover:bg-indigo-700 transition-all duration-200 ease-in-out mr-2"
                    onClick={() => subirABlockchain(convocatoria.id)}
                  >
                    <i className="fa-solid fa-cloud-upload-alt"></i> {/* Font Awesome Icon */}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-4 text-lg text-gray-400">
                No hay convocatorias registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ConvocatoriasAdminPage;
