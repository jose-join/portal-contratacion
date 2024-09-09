import React, { useState } from 'react';
import { FormData } from '../../../interfaces/formDataInterfaces';

interface RequisitosProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const Requisitos: React.FC<RequisitosProps> = ({ formData, handleChange, onSave }) => {
  const handleSave = () => {
    if (!formData.formacionAcademica || !formData.experienciaLaboral || !formData.habilidadesTecnicas || !formData.competencias) {
      alert("Todos los campos son obligatorios");
    } else {
      onSave();
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-2xl font-bold mb-4">Requisitos del Puesto</h3>
      <input
        type="text"
        name="formacionAcademica"
        value={formData.formacionAcademica}
        onChange={handleChange}
        placeholder="Formación Académica"
        className="mt-1 block w-full border border-gray-700 bg-black text-white p-2 rounded-md focus:outline-none focus:border-indigo-500"
      />
      <input
        type="text"
        name="experienciaLaboral"
        value={formData.experienciaLaboral}
        onChange={handleChange}
        placeholder="Experiencia Laboral"
        className="mt-4 block w-full border border-gray-700 bg-black text-white p-2 rounded-md focus:outline-none focus:border-indigo-500"
      />
      <input
        type="text"
        name="habilidadesTecnicas"
        value={formData.habilidadesTecnicas}
        onChange={handleChange}
        placeholder="Habilidades Técnicas"
        className="mt-4 block w-full border border-gray-700 bg-black text-white p-2 rounded-md focus:outline-none focus:border-indigo-500"
      />
      <input
        type="text"
        name="competencias"
        value={formData.competencias}
        onChange={handleChange}
        placeholder="Competencias"
        className="mt-4 block w-full border border-gray-700 bg-black text-white p-2 rounded-md focus:outline-none focus:border-indigo-500"
      />
      <button onClick={handleSave} className="mt-6 btn-primary">Guardar y Continuar</button>
    </div>
  );
};

export default Requisitos;
