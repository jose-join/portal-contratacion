import React from 'react';

const DocumentoList = () => {
  return (
    <div className="p-4 bg-gray-900 rounded-xl fade-in">
      <h2 className="text-3xl font-bold mb-4">Lista de Documentos</h2>
      <ul className="list-disc list-inside">
        {/* Itera sobre una lista de documentos y los muestras */}
        <li className="mb-2"><strong>Documento 1</strong></li>
        <li className="mb-2"><strong>Documento 2</strong></li>
        {/* Más elementos */}
      </ul>
    </div>
  );
};

export default DocumentoList;
