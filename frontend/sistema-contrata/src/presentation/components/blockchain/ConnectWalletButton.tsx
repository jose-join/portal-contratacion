import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const ConnectWalletButton: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);

  useEffect(() => {
    const { ethereum } = window as any;
    if (ethereum) {
      setWeb3(new Web3(ethereum));
    } else if ((window as any).web3) {
      setWeb3(new Web3((window as any).web3.currentProvider));
    } else {
      alert('MetaMask no está instalado');
    }
  }, []);

  const connectWallet = async () => {
    const { ethereum } = window as any;
    if (web3 && ethereum) {
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    }
  };

  return (
    <div className="connect-wallet-button">
      {account ? (
        <p>Conectado: {account}</p>
      ) : (
        <button onClick={connectWallet} className="btn-primary">
          Conectar MetaMask
        </button>
      )}
    </div>
  );
};

export default ConnectWalletButton;
