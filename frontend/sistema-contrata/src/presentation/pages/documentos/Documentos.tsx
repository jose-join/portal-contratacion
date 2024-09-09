import React from 'react';
import { DocumentoUpload, DocumentoList } from '../../components';

const Documentos = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Documentos</h1>
      <p>Revisa y administra los documentos subidos por los postulantes.</p>
      <DocumentoUpload />
      <DocumentoList />
    </div>
  );
};

export default Documentos;
