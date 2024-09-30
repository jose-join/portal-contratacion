import React, { useState, useEffect } from 'react';

interface Convocatoria {
  id?: string;
  titulo: string;
  descripcion: string;
  formacionAcademica: string;
  experienciaLaboral: string;
  lugarTrabajo: string;
  fechasImportantes: {
    inicioConvocatoria: string;
    cierreConvocatoria: string;
    fechaEvaluacion: string;
    publicacionResultados: string;
  };
  validado?: boolean;
  subidoBlockchain?: boolean;
}

const ConvocatoriaList: React.FC = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);

  // Cargar convocatorias desde la API del backend
  const loadConvocatorias = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      console.log('Token de autenticación:', token);

      const response = await fetch('http://localhost:3000/api/convocatoria', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token // Asegúrate de enviar el token de autenticación
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar las convocatorias");
      }

      const data = await response.json();
      console.log("Convocatorias cargadas:", data);  // Agregar depuración
      setConvocatorias(data);
    } catch (error) {
      console.error('Error al cargar las convocatorias desde el backend:', error);
    }
  };

  // Manejar la eliminación de convocatorias a través de la API del backend
  const handleDelete = async (id: string | undefined) => {
    if (id) {
      try {
        const token = localStorage.getItem("token") || "";
        console.log('Eliminando convocatoria con id:', id);  // Depurar id
        console.log('Token de autenticación para eliminar:', token);  // Verificar token

        const response = await fetch(`http://localhost:3000/api/convocatoria/${id}`, {
          method: 'DELETE',
          headers: {
            "x-auth-token": token // Asegúrate de enviar el token de autenticación
          }
        });

        if (response.ok) {
          console.log("Convocatoria eliminada:", id);  // Depuración
          setConvocatorias(prevConvocatorias => prevConvocatorias.filter(convocatoria => convocatoria.id !== id));
          alert('Convocatoria eliminada.');
        } else {
          const errorText = await response.text();
          console.error('Error al eliminar la convocatoria:', errorText);
        }
      } catch (error) {
        console.error('Error al eliminar la convocatoria:', error);
      }
    } else {
      console.error('No se ha proporcionado un id válido para eliminar');
    }
  };

  // Manejar la verificación de convocatorias a través de la API del backend
  const handleVerify = async (id: string | undefined) => {
    if (id) {
      try {
        const token = localStorage.getItem("token") || "";
        const response = await fetch(`http://localhost:3000/api/convocatoria/validar/${id}`, {
          method: 'PUT',
          headers: {
            "x-auth-token": token // Asegúrate de enviar el token de autenticación
          }
        });

        if (response.ok) {
          console.log("Convocatoria verificada:", id);  // Depuración
          setConvocatorias(prevConvocatorias =>
            prevConvocatorias.map(convocatoria => convocatoria.id === id ? { ...convocatoria, validado: true } : convocatoria)
          );
          alert('Convocatoria validada.');
        } else {
          const errorText = await response.text();
          console.error('Error al validar la convocatoria:', errorText);
        }
      } catch (error) {
        console.error('Error al validar la convocatoria:', error);
      }
    }
  };

  // Manejar la subida de convocatorias a la blockchain
  const handleSubirBlockchain = async (id: string | undefined) => {
    if (id) {
      try {
        const token = localStorage.getItem("token") || "";
        const response = await fetch(`http://localhost:3000/api/convocatoria/blockchain/${id}`, {
          method: 'POST',
          headers: {
            "x-auth-token": token // Asegúrate de enviar el token de autenticación
          }
        });

        if (response.ok) {
          console.log("Convocatoria subida a la blockchain:", id);  // Depuración
          setConvocatorias(prevConvocatorias =>
            prevConvocatorias.map(convocatoria => convocatoria.id === id ? { ...convocatoria, subidoBlockchain: true } : convocatoria)
          );
          alert('Convocatoria subida a la blockchain.');
        } else {
          const errorText = await response.text();
          console.error('Error al subir la convocatoria a la blockchain:', errorText);
        }
      } catch (error) {
        console.error('Error al subir la convocatoria a la blockchain:', error);
      }
    }
  };

  const getEstadoConvocatoria = (convocatoria: Convocatoria) => {
    const today = new Date();
    const inicio = new Date(convocatoria.fechasImportantes.inicioConvocatoria);
    const evaluacion = new Date(convocatoria.fechasImportantes.fechaEvaluacion);
    const fin = new Date(convocatoria.fechasImportantes.cierreConvocatoria);
    const resultados = new Date(convocatoria.fechasImportantes.publicacionResultados);

    if (today >= inicio && today < evaluacion) {
      return "Iniciado";
    } else if (today >= evaluacion && today < fin) {
      return "En Proceso";
    } else if (today >= fin && today < resultados) {
      return "Finalizado";
    } else if (today >= resultados) {
      return "Resultados Publicados";
    }
    return "Pendiente";
  };

  useEffect(() => {
    loadConvocatorias();
  }, []);

  return (
    <div className="p-4 bg-gray-900 rounded-xl fade-in max-w-full h-[70vh] flex flex-col justify-between">
      <h2 className="text-3xl font-bold mb-4 text-white">Lista de Convocatorias</h2>
      
      <div className="flex-grow overflow-y-auto space-y-4 p-4 border border-gray-800 rounded-lg">
        {convocatorias.length > 0 ? (
          convocatorias.map((convocatoria, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
              <h3 className="text-xl font-semibold mb-2 text-indigo-400">{convocatoria.titulo}</h3>
              <p className="mb-2"><strong>Descripción:</strong> {convocatoria.descripcion}</p>
              <p className="mb-2"><strong>Formación Académica:</strong> {convocatoria.formacionAcademica}</p>
              <p className="mb-2"><strong>Lugar de Trabajo:</strong> {convocatoria.lugarTrabajo}</p>
              <p className="mb-2">
                <strong>Fecha de Inicio:</strong> {convocatoria.fechasImportantes.inicioConvocatoria} &nbsp; | &nbsp;
                <strong>Fecha de Cierre:</strong> {convocatoria.fechasImportantes.cierreConvocatoria}
              </p>
              <p className="mb-2"><strong>Estado:</strong> {getEstadoConvocatoria(convocatoria)}</p>

              <div className="flex space-x-4 mt-4">
                {convocatoria.subidoBlockchain ? (
                  <p className="text-red-500 font-bold">Subido a Blockchain</p>
                ) : (
                  convocatoria.validado && (
                    <p className="text-green-500 font-bold">Validado</p>
                  )
                )}

                <button
                  onClick={() => handleDelete(convocatoria.id)}
                  className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                  Eliminar
                </button>

                <button
                  onClick={() => handleVerify(convocatoria.id)}
                  className={`bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded ${convocatoria.validado ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={convocatoria.validado || convocatoria.subidoBlockchain}
                >
                  {convocatoria.validado ? 'Verificada' : 'Verificar'}
                </button>

                {convocatoria.validado && (
                  <button
                    onClick={() => handleSubirBlockchain(convocatoria.id)}
                    className={`bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded ${convocatoria.subidoBlockchain ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {convocatoria.subidoBlockchain ? 'Subida a Blockchain' : 'Subir a Blockchain'}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-white">No hay convocatorias disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default ConvocatoriaList;
