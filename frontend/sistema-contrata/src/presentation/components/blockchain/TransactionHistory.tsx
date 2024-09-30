import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Definición de la interfaz para una transacción
interface Transaccion {
  tipo: string;
  transactionHash: string;
  returnValues: {
    idConvocatoria: string;
    timestamp: number;
  };
}

const TransactionHistory: React.FC = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]); // Estado para almacenar las transacciones
  const [loading, setLoading] = useState(true); // Estado para controlar el indicador de carga
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores

  useEffect(() => {
    const token = localStorage.getItem('token'); // Obtiene el token JWT almacenado en localStorage

    // Función para obtener el historial de transacciones
    const obtenerTransacciones = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/blockchain/transacciones', {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });
        setTransacciones(response.data.eventos); // Almacenar las transacciones en el estado
      } catch (error) {
        console.error('Error al obtener las transacciones:', error);
        setError('Error al cargar las transacciones. Inténtalo nuevamente.'); // Almacenar el error
      } finally {
        setLoading(false); // Finalizar el indicador de carga
      }
    };

    obtenerTransacciones(); // Ejecutar la función para obtener las transacciones
  }, []);

  // Mostrar indicador de carga mientras se obtienen las transacciones
  if (loading) {
    return <div className="text-center text-white">Cargando historial de transacciones...</div>;
  }

  // Mostrar mensaje de error en caso de fallo
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg fade-in">
      <h2 className="text-3xl font-bold mb-6 text-white">Historial de Transacciones</h2>
      <div className="max-h-96 overflow-y-auto p-4 border border-gray-700 rounded-lg">
        <ul className="list-disc list-inside space-y-4 text-white">
          {transacciones.length > 0 ? (
            transacciones.map((transaccion, index) => (
              <li key={index} className="mb-4 pl-4">
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <strong className="block mb-2 text-blue-400">Transacción {index + 1}:</strong>
                  <p><strong className="text-indigo-300">Hash:</strong> {transaccion.transactionHash}</p>
                  <p><strong className="text-indigo-300">Tipo:</strong> {transaccion.tipo}</p>
                  <p><strong className="text-indigo-300">ID Convocatoria:</strong> {transaccion.returnValues.idConvocatoria}</p>
                  <p>
                    <strong className="text-indigo-300">Timestamp:</strong> {new Date(transaccion.returnValues.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="text-center text-white">No se encontraron transacciones.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TransactionHistory;
