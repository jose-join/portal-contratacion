import React, { useState } from 'react';
import Modal from '../../components/Modal';
import ConvocatoriasBlockchain from '../../components/convocatoriaPostulante/ConvocatoriasBlockchain';

const ConvocatoriaPostulante = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="p-4 relative">
      <h1 className="text-2xl font-bold mb-4 text-white">Convocatorias en Blockchain</h1>

      {/* Botón para abrir el modal de información */}
      <button className="btn-primary mb-4" onClick={openModal}>
        Más Información
      </button>

      {/* Modal que se abre al hacer clic en el botón */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="p-4 text-white">
          <h2 className="text-lg font-semibold mb-2">Información de Convocatorias</h2>
          <p>Aquí podrás encontrar las convocatorias subidas a la blockchain. Postúlate a las que te interesen.</p>
          <button className="btn-primary mt-4" onClick={closeModal}>Cerrar</button>
        </div>
      </Modal>

      {/* Listar convocatorias subidas a la blockchain */}
      <ConvocatoriasBlockchain />
    </div>
  );
};

export default ConvocatoriaPostulante;
