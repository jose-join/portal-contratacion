import React, { useState, useEffect } from 'react';

interface Convocatoria {
  subidoBlockchain: any;
  id?: string;
  titulo: string;
  descripcion: string;
  formacionAcademica: string;
  experienciaLaboral: string;
  lugarTrabajo: string;
  fechasImportantes: {
    inicioConvocatoria: string;
    cierreConvocatoria: string;
  };
  documentosRequeridos: {
    cv: boolean;
    dni: boolean;
    certificadosEstudios: boolean;
    certificadosTrabajo: boolean;
    declaracionJurada: boolean;
  };
}

const ConvocatoriasBlockchain: React.FC = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [postulaciones, setPostulaciones] = useState<string[]>([]); // Almacenar los IDs de convocatorias a las que el usuario ya se postuló
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    loadConvocatorias(); // Cargar convocatorias al montar el componente
    loadPostulaciones(); // Cargar postulaciones del usuario al montar el componente
  }, []);

  // Cargar convocatorias desde la API del backend
  const loadConvocatorias = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch('http://localhost:3000/api/convocatoria', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        }
      });
  
      if (!response.ok) {
        throw new Error("Error al cargar las convocatorias");
      }
  
      const data = await response.json();
  
      // Filtrar solo las convocatorias que se subieron a la blockchain
      const convocatoriasBlockchain = data.filter((convocatoria: Convocatoria) => convocatoria.subidoBlockchain);
  
      setConvocatorias(convocatoriasBlockchain);
    } catch (error) {
      console.error('Error al cargar las convocatorias desde el backend:', error);
    }
  };

  // Cargar las postulaciones del usuario para saber a qué convocatorias ya se postuló
  const loadPostulaciones = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch('http://localhost:3000/api/postulante/ver-postulaciones', {
        method: 'GET',
        headers: {
          'x-auth-token': token,
        }
      });

      const data = await response.json();
      if (response.ok && data) {
        // Guardar los IDs de las convocatorias a las que el postulante ya se postuló
        const idsConvocatoriasPostuladas = data.postulaciones.map((postulacion: any) => postulacion.idConvocatoria);
        setPostulaciones(idsConvocatoriasPostuladas);
      }
    } catch (error) {
      console.error('Error al cargar las postulaciones:', error);
    }
  };

  // Manejar la postulación a una convocatoria
  const handlePostularse = async (convocatoria: Convocatoria) => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`http://localhost:3000/api/postulante/postular/${convocatoria.id}`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idConvocatoria: convocatoria.id }),
      });
  
      if (!response.ok) {
        throw new Error('Error al realizar la postulación');
      }
  
      setMensaje('Postulación realizada con éxito.');
      setPostulaciones([...postulaciones, convocatoria.id!]); // Añadir el ID de la convocatoria postulada
    } catch (error) {
      console.error('Error al postularse:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-xl max-w-full h-[70vh] flex flex-col justify-between">
      <h2 className="text-3xl font-bold mb-4 text-white">Convocatorias en Blockchain</h2>

      <div className="flex-grow overflow-y-auto space-y-4 p-4 border border-gray-800 rounded-lg">
        {convocatorias.length > 0 ? (
          convocatorias.map((convocatoria, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-indigo-400">{convocatoria.titulo}</h3>
                  <p className="mb-2"><strong>Descripción:</strong> {convocatoria.descripcion}</p>
                  <p className="mb-2"><strong>Formación Académica:</strong> {convocatoria.formacionAcademica}</p>
                  <p className="mb-2"><strong>Lugar de Trabajo:</strong> {convocatoria.lugarTrabajo}</p>
                  <p className="mb-2">
                    <strong>Fecha de Inicio:</strong> {convocatoria.fechasImportantes.inicioConvocatoria} &nbsp; | &nbsp;
                    <strong>Fecha de Cierre:</strong> {convocatoria.fechasImportantes.cierreConvocatoria}
                  </p>
                </div>

                <div>
                  {postulaciones.includes(convocatoria.id!) ? (
                    <p className="text-green-500 font-bold">Ya te has postulado.</p>
                  ) : (
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
                      onClick={() => handlePostularse(convocatoria)}
                    >
                      Postularse
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white">No hay convocatorias subidas a la blockchain.</p>
        )}
      </div>

      {mensaje && (
        <div className="bg-green-500 text-white p-4 mt-4 rounded">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default ConvocatoriasBlockchain;
