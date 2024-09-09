import React from 'react';

const TransactionHistory = () => {
  return (
    <div className="p-4 bg-gray-900 rounded-xl fade-in">
      <h2 className="text-3xl font-bold mb-4">Historial de Transacciones</h2>
      <ul className="list-disc list-inside">
        {/* Itera sobre una lista de transacciones y las muestras */}
        <li className="mb-2"><strong>Transacción 1:</strong> Hash...</li>
        <li className="mb-2"><strong>Transacción 2:</strong> Hash...</li>
        {/* Más elementos */}
      </ul>
    </div>
  );
};

export default TransactionHistory;
