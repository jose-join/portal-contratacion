import React from 'react';
import { FormData } from '../../../interfaces/formDataInterfaces';  // Ajusta la ruta si es necesario

interface ConvocatoriaDetailsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
}

const ConvocatoriaDetails: React.FC<ConvocatoriaDetailsProps> = ({ formData, handleChange, onSave }) => {
  
  const handleSave = () => {
    if (!formData.titulo || !formData.descripcion) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    onSave();
  };

  return (
    <div className="mb-4">
      <h3 className="text-2xl font-bold mb-4">Detalles de la Convocatoria</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">Título del Puesto</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-700 bg-black text-white p-2 rounded-md focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">Descripción del Puesto</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-700 bg-black text-white p-2 rounded-md focus:outline-none focus:border-indigo-500"
        />
      </div>
      <button onClick={handleSave} className="btn-primary mt-6">Guardar y Continuar</button>
    </div>
  );
};

export default ConvocatoriaDetails;
