import React, { ChangeEvent } from 'react';
import { CondicionesLaboralesData } from '../../../interfaces/formDataInterfaces';

interface CondicionesLaboralesProps {
  formData: CondicionesLaboralesData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => void;
}

const CondicionesLaborales: React.FC<CondicionesLaboralesProps> = ({ formData, handleChange, onSave }) => {
  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Solo permitir la entrada de números
    if (!isNaN(Number(value)) || value === "") {
      handleChange(e);
    }
  };

  const handleSave = () => {
    if (!formData.tipoContrato || !formData.salario || !formData.jornadaLaboral) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    if (isNaN(Number(formData.salario))) {
      alert("El salario debe ser un número válido.");
      return;
    }
    onSave();
  };

  return (
    <div className="mb-4">
      <h3 className="text-2xl font-bold mb-4">Condiciones Laborales</h3>
      
      <label className="block mb-2 text-sm font-medium text-gray-300">Tipo de Contrato</label>
      <select
        name="tipoContrato"
        value={formData.tipoContrato}
        onChange={handleChange}
        className="mt-1 block w-full border border-gray-700 bg-black text-white p-2 rounded-md"
      >
        <option value="">Seleccione un tipo de contrato</option>
        <option value="CAS">Contrato Administrativo de Servicios (CAS)</option>
        <option value="Indeterminado">Contrato a Plazo Indeterminado</option>
        <option value="Determinado">Contrato a Plazo Determinado</option>
        <option value="Modal">Contrato Modal</option>
      </select>
      
      <label className="block mb-2 mt-4 text-sm font-medium text-gray-300">Salario</label>
      <div className="flex items-center">
        <span className="mr-2 text-gray-300">S/</span>
        <input
          type="text"
          name="salario"
          value={formData.salario}
          onChange={handleNumberChange}
          placeholder="Salario"
          className="mt-1 block w-full border border-gray-700 bg-black text-white p-2 rounded-md"
        />
      </div>
      
      <label className="block mb-2 mt-4 text-sm font-medium text-gray-300">Jornada Laboral</label>
      <select
        name="jornadaLaboral"
        value={formData.jornadaLaboral}
        onChange={handleChange}
        className="mt-1 block w-full border border-gray-700 bg-black text-white p-2 rounded-md"
      >
        <option value="">Seleccione la jornada laboral</option>
        <option value="Tiempo Completo">Tiempo Completo</option>
        <option value="Medio Tiempo">Medio Tiempo</option>
        <option value="Tiempo Parcial">Tiempo Parcial</option>
      </select>
      
      <button onClick={handleSave} className="mt-6 btn-primary">Guardar y Continuar</button>
    </div>
  );
};

export default CondicionesLaborales;
