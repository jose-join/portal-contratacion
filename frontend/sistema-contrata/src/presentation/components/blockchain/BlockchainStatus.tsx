import React from 'react';

const BlockchainStatus = () => {
  return (
    <div className="p-4 bg-gray-900 rounded-xl fade-in">
      <h2 className="text-3xl font-bold mb-4">Estado de la Blockchain</h2>
      <p><strong>Última transacción:</strong> Hash...</p>
      <p><strong>Número de bloques:</strong> 1000</p>
      {/* Más información sobre el estado de la blockchain */}
    </div>
  );
};

export default BlockchainStatus;
