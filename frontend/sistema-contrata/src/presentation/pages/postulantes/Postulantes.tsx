import React from 'react';
import { PostulanteForm, PostulanteList } from '../../components';

const Postulantes = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Postulantes</h1>
      <p>Administra los postulantes a las convocatorias.</p>
      <PostulanteForm />
      <PostulanteList />
    </div>
  );
};

export default Postulantes;
