import React from 'react';

const PostulanteDetail = () => {
  return (
    <div className="p-4 bg-gray-900 rounded-xl fade-in">
      <h2 className="text-3xl font-bold mb-4">Detalles del Postulante</h2>
      <p><strong>Nombre:</strong> Postulante 1</p>
      <p><strong>Email:</strong> ejemplo@correo.com</p>
      <p><strong>CV:</strong> <a href="#" className="text-indigo-400 hover:underline">Enlace al CV</a></p>
      {/* Agrega más detalles según sea necesario */}
    </div>
  );
};

export default PostulanteDetail;
