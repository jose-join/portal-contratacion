import React, { useState } from 'react';

const DocumentoUpload = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (file) {
      // Lógica para manejar la subida de documentos
      console.log(file);
    } else {
      console.log("No se seleccionó ningún archivo.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]); // Asignar el primer archivo seleccionado
    } else {
      setFile(null); // Si no hay archivos seleccionados, el estado se establece en null
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-xl fade-in">
      <h2 className="text-3xl font-bold mb-4">Subir Documento</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Documento</label>
          <input 
            type="file" 
            onChange={handleFileChange} 
            className="mt-1 block w-full border border-gray-700 bg-black text-white p-2 rounded-md"
          />
        </div>
        <button type="submit" className="btn-primary">
          Subir
        </button>
      </form>
    </div>
  );
};

export default DocumentoUpload;
