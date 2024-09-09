import React, { useState } from 'react';
import { FormData } from '../../../interfaces/formDataInterfaces';

interface ProcesoSeleccionProps {
  formData: FormData;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const ProcesoSeleccion: React.FC<ProcesoSeleccionProps> = ({ formData, handleCheckboxChange, onSave }) => {
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!formData.procesoSeleccion.evaluacionCurricular || !formData.procesoSeleccion.entrevistaPersonal) {
      alert("Debe marcar 'Evaluación Curricular' y 'Entrevista Personal' como obligatorias.");
      setError("Debe marcar 'Evaluación Curricular' y 'Entrevista Personal' como obligatorias.");
    } else {
      setError(null);
      onSave();
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-2xl font-bold mb-4">Proceso de Selección</h3>
      <div className="mb-4">
        <label className="block mb-2">
          <input
            type="checkbox"
            name="procesoSeleccion.evaluacionCurricular"
            checked={formData.procesoSeleccion.evaluacionCurricular}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Evaluación Curricular <span className="text-red-500">*</span>
        </label>
        <label className="block mb-2">
          <input
            type="checkbox"
            name="procesoSeleccion.entrevistaPersonal"
            checked={formData.procesoSeleccion.entrevistaPersonal}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Entrevista Personal <span className="text-red-500">*</span>
        </label>
        <label className="block mb-2">
          <input
            type="checkbox"
            name="procesoSeleccion.evaluacionTecnica"
            checked={formData.procesoSeleccion.evaluacionTecnica}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Evaluación Técnica
        </label>
        <label className="block mb-2">
          <input
            type="checkbox"
            name="procesoSeleccion.evaluacionPsicologica"
            checked={formData.procesoSeleccion.evaluacionPsicologica}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Evaluación Psicológica
        </label>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <button onClick={handleSave} className="mt-4 btn-primary">Guardar y Continuar</button>
    </div>
  );
};

export default ProcesoSeleccion;
