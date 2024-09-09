import React, { useState } from 'react';

const PostulanteForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Tipar el evento 'e' como React.FormEvent<HTMLFormElement>
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Lógica para manejar el envío del formulario
    console.log({ name, email });
  };

  // Tipar el evento 'e' como React.ChangeEvent<HTMLInputElement>
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <div className="p-4 bg-gray-900 rounded-xl fade-in">
      <h2 className="text-3xl font-bold mb-4">Formulario de Postulante</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Nombre</label>
          <input 
            type="text" 
            value={name} 
            onChange={handleNameChange} 
            className="mt-1 block w-full border border-gray-700 bg-black text-white p-2 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={handleEmailChange} 
            className="mt-1 block w-full border border-gray-700 bg-black text-white p-2 rounded-md"
          />
        </div>
        <button type="submit" className="btn-primary">
          Guardar Postulante
        </button>
      </form>
    </div>
  );
};

export default PostulanteForm;
