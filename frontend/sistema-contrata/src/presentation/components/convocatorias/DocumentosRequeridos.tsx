import React, { useState } from 'react';
import { FormData } from '../../../interfaces/formDataInterfaces';

interface DocumentosRequeridosProps {
  formData: FormData;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const DocumentosRequeridos: React.FC<DocumentosRequeridosProps> = ({ formData, handleCheckboxChange, onSave }) => {
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const { cv, dni } = formData.documentosRequeridos;
    
    if (!cv || !dni) {
      alert("Debe marcar 'Curriculum Vitae' y 'Copia de DNI' como obligatorios.");
      setError("Debe marcar 'Curriculum Vitae' y 'Copia de DNI' como obligatorios.");
    } else {
      setError(null);
      onSave();
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-2xl font-bold mb-4">Documentos Requeridos</h3>
      <div className="mb-4">
        <label className="block mb-2">
          <input
            type="checkbox"
            name="documentosRequeridos.cv"
            checked={formData.documentosRequeridos.cv}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Curriculum Vitae <span className="text-red-500">*</span>
        </label>
        <label className="block mb-2">
          <input
            type="checkbox"
            name="documentosRequeridos.dni"
            checked={formData.documentosRequeridos.dni}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Copia de DNI <span className="text-red-500">*</span>
        </label>
        <label className="block mb-2">
          <input
            type="checkbox"
            name="documentosRequeridos.certificadosEstudios"
            checked={formData.documentosRequeridos.certificadosEstudios || false} // Manejo del valor opcional
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Certificados de Estudios
        </label>
        <label className="block mb-2">
          <input
            type="checkbox"
            name="documentosRequeridos.certificadosTrabajo"
            checked={formData.documentosRequeridos.certificadosTrabajo || false} // Manejo del valor opcional
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Certificados de Trabajo
        </label>
        <label className="block mb-2">
          <input
            type="checkbox"
            name="documentosRequeridos.declaracionJurada"
            checked={formData.documentosRequeridos.declaracionJurada || false} // Manejo del valor opcional
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Declaración Jurada
        </label>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <button onClick={handleSave} className="mt-4 btn-primary">Guardar y Continuar</button>
    </div>
  );
};

export default DocumentosRequeridos;
