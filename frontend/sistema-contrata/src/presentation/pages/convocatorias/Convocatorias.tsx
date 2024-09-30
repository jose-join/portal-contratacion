import React, { useState } from 'react';
import { ConvocatoriaList, NewConvocatoriaForm } from '../../components';
import Modal from '../../components/Modal';

const Convocatorias = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="p-4 relative">
      <h1 className="text-2xl font-bold mb-4">Gestión de Convocatorias</h1>
      

      {/* Botón para abrir el modal */}
      <button className="btn-primary mb-4" onClick={openModal}>
        Crear Nueva Convocatoria
      </button>
      
      {/* Modal para crear nueva convocatoria */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <NewConvocatoriaForm closeModal={closeModal} />
      </Modal>

      <ConvocatoriaList />
    </div>
  );
};

export default Convocatorias;
