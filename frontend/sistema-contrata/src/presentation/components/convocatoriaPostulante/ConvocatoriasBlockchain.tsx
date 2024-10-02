import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';

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
  postulado?: boolean; // Nuevo campo para saber si el usuario ya se ha postulado
}

const ConvocatoriasBlockchain: React.FC = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<Convocatoria | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [dni, setDni] = useState<File | null>(null);
  const [postulado, setPostulado] = useState(false);

  useEffect(() => {
    loadConvocatorias();
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
      const convocatoriasBlockchain = data.filter((convocatoria: Convocatoria) => convocatoria.subidoBlockchain);

      // Verificar para cada convocatoria si el usuario ya se ha postulado
      const convocatoriasConPostulacion = await Promise.all(convocatoriasBlockchain.map(async (convocatoria: Convocatoria) => {
        const postuladoResponse = await fetch(`http://localhost:3000/api/postulante/ver-postulacion/${convocatoria.id}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token
          }
        });

        if (postuladoResponse.ok) {
          const postuladoData = await postuladoResponse.json();
          return { ...convocatoria, postulado: postuladoData.postulado }; // Añadir el estado de postulación
        }
        return convocatoria;
      }));

      setConvocatorias(convocatoriasConPostulacion);
    } catch (error) {
      console.error('Error al cargar las convocatorias desde el backend:', error);
    }
  };

  // Manejar la postulación a una convocatoria (subir documentos)
  const handlePostularse = (convocatoria: Convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    setIsModalOpen(true);
  };

  // Manejar la subida de documentos al backend
  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cv || !dni || !selectedConvocatoria) {
      alert('Debes subir ambos documentos.');
      return;
    }

    const formData = new FormData();
    formData.append('cv', cv);
    formData.append('dni', dni);

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`http://localhost:3000/api/postulante/subir-documentos`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir los documentos');
      }

      setPostulado(true); // Permitir finalizar la postulación
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al subir los documentos:', error);
    }
  };

  // Manejar la finalización de la postulación
  const handleFinalizarPostulacion = async () => {
    if (!selectedConvocatoria) return;

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`http://localhost:3000/api/postulante/postular/${selectedConvocatoria.id}`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        }
      });
      console.log('este es el response:', response);

      if (!response.ok) {
        throw new Error('Error al finalizar la postulación');
      }

      alert('Postulación finalizada con éxito.');
      setPostulado(false);
    } catch (error) {
      console.error('Error al finalizar la postulación:', error);
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

  return (
    <div className="p-4 bg-gray-900 rounded-xl fade-in max-w-full h-[70vh] flex flex-col justify-between">
      <h2 className="text-3xl font-bold mb-4 text-white">Convocatorias en Blockchain</h2>

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

              {/* Mostrar si la convocatoria ha finalizado */}
              {getEstadoConvocatoria(convocatoria) === 'Finalizado' && (
                <p className="text-red-500 font-bold">Esta convocatoria ha finalizado.</p>
              )}

              <div className="flex space-x-4 mt-4">
                {convocatoria.postulado ? (
                  <p className="text-green-500">Ya te has postulado a esta convocatoria.</p>
                ) : (
                  getEstadoConvocatoria(convocatoria) !== 'Finalizado' && (
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
                      onClick={() => handlePostularse(convocatoria)}
                    >
                      Postularse
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-white">No hay convocatorias subidas a la blockchain.</p>
        )}
      </div>

      {/* Modal para subir documentos */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleDocumentSubmit} className="p-4 text-white">
          <h2 className="text-lg font-semibold mb-2">Subir Documentos para la Convocatoria</h2>
          <div className="mb-4">
            <label className="block mb-2">Copia de DNI:</label>
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) => setDni(e.target.files ? e.target.files[0] : null)}
              className="bg-gray-700 p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Currículum Vitae (CV):</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCv(e.target.files ? e.target.files[0] : null)}
              className="bg-gray-700 p-2 rounded"
              required
            />
          </div>
          <button type="submit" className="btn-primary">Subir Documentos</button>
        </form>
      </Modal>

      {/* Botón de "Finalizar Postulación" */}
      {postulado && (
        <button className="btn-primary mt-4" onClick={handleFinalizarPostulacion}>
          Finalizar Postulación
        </button>
      )}
    </div>
  );
};

export default ConvocatoriasBlockchain;
