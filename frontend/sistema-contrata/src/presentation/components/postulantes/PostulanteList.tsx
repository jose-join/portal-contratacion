import React from 'react';

const PostulanteList = () => {
  return (
    <div className="p-4 bg-gray-900 rounded-xl fade-in">
      <h2 className="text-3xl font-bold mb-4">Lista de Postulantes</h2>
      <ul className="list-disc list-inside">
        {/* Aquí iteras sobre una lista de postulantes y los muestras */}
        <li className="mb-2"><strong>Postulante 1</strong></li>
        <li className="mb-2"><strong>Postulante 2</strong></li>
        {/* Más elementos */}
      </ul>
    </div>
  );
};

export default PostulanteList;
