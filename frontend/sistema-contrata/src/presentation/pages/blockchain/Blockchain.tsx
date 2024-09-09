import React from 'react';
import { BlockchainStatus, TransactionHistory } from '../../components';

const Blockchain = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Estado de la Blockchain</h1>
      <p>Monitorea la integridad y las transacciones recientes en la blockchain.</p>
      <BlockchainStatus />
      <TransactionHistory />
    </div>
  );
};

export default Blockchain;
