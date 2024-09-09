import React, { ChangeEvent, useState } from 'react';
import { FormData } from '../../../interfaces/formDataInterfaces';

interface LugarTrabajoProps {
  formData: FormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => void;
}

const LugarTrabajo: React.FC<LugarTrabajoProps> = ({ formData, handleChange, onSave }) => {
  const [showOtherInput, setShowOtherInput] = useState<boolean>(false);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target;
    handleChange(e);
    if (value === "Otros") {
      setShowOtherInput(true);
    } else {
      setShowOtherInput(false);
    }
  };

  const handleSave = () => {
    if (!formData.lugarTrabajo || (formData.lugarTrabajo === "Otros" && !formData.otroLugarTrabajo)) {
      alert("Debe seleccionar un lugar de trabajo o especificar uno si eligió 'Otros'.");
      return;
    }
    onSave();
  };

  return (
    <div className="mb-4">
      <h3 className="text-2xl font-bold mb-4">Lugar de Trabajo</h3>
      <select
        name="lugarTrabajo"
        value={formData.lugarTrabajo}
        onChange={handleSelectChange}
        className="mt-1 block w-full border border-gray-700 bg-black text-white p-2 rounded-md"
      >
        <option value="">Seleccione un lugar de trabajo</option>
        <option value="Oficina Central">Oficina Central</option>
        <option value="Planta de Tratamiento">Planta de Tratamiento</option>
        <option value="Obras Públicas">Obras Públicas</option>
        <option value="Desarrollo Urbano">Desarrollo Urbano</option>
        <option value="Otros">Otros</option>
      </select>

      {showOtherInput && (
        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium text-gray-300">Especifique el lugar de trabajo</label>
          <input
            type="text"
            name="otroLugarTrabajo"
            value={formData.otroLugarTrabajo}
            onChange={handleChange}
            placeholder="Escriba el lugar de trabajo"
            className="mt-1 block w-full border border-gray-700 bg-black text-white p-2 rounded-md"
          />
        </div>
      )}

      {formData.lugarTrabajo === "" && <p className="text-red-500 mt-2">Debe seleccionar un lugar de trabajo.</p>}
      <button onClick={handleSave} className="mt-6 btn-primary">Guardar y Continuar</button>
    </div>
  );
};

export default LugarTrabajo;
