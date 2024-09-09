import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ConvocatoriaABI from '../../abis/ConvocatoriaABI.json'; // Importa el ABI desde el archivo JSON

interface Convocatoria {
  titulo: '',
    descripcion: '',
    formacionAcademica: '',
    experienciaLaboral: '',
    habilidadesTecnicas: '',
    competencias: '',
    documentosRequeridos: {
      cv: false,
      dni: false,
      certificadosEstudios: false,
      certificadosTrabajo: false,
      declaracionJurada: false,
    },
    procesoSeleccion: {
      evaluacionCurricular: false,
      entrevistaPersonal: false,
      evaluacionTecnica: false,
      evaluacionPsicologica: false,
    },
    condicionesLaborales: {
      tipoContrato: '',
      salario: '',
      jornadaLaboral: '',
    },
    lugarTrabajo: '',
    otroLugarTrabajo: '',
    fechasImportantes: {
      inicioConvocatoria: '',
      cierreConvocatoria: '',
      fechaEvaluacion: '',
      publicacionResultados: '',
    }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const ConvocatoriaList: React.FC = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
  const [accountsRequested, setAccountsRequested] = useState<boolean>(false);

  // Usa el ABI importado desde el JSON
  const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  useEffect(() => {
    if (contract) {
      console.log(contract.methods);
    }
  }, [contract]);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = window.ethereum as Web3['currentProvider'];
          const web3Instance = new Web3(provider);
          setWeb3(web3Instance);

          const contractInstance = new web3Instance.eth.Contract(ConvocatoriaABI.abi, contractAddress);
          setContract(contractInstance);

          if (!loadingAccounts && !accountsRequested) {
            setLoadingAccounts(true);
            setAccountsRequested(true);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            setLoadingAccounts(false);
          }
        } catch (error: any) {
          if (error.code === -32002) {
            console.warn("MetaMask ya está procesando una solicitud de cuentas. Por favor espera.");
          } else {
            console.error("Error al solicitar cuentas de MetaMask:", error);
          }
          setLoadingAccounts(false);
        }
      } else {
        alert('MetaMask no está instalado. Por favor, instala MetaMask para usar esta aplicación.');
      }
    };

    if (!web3) {
      initializeWeb3();
    }
  }, [web3, loadingAccounts, accountsRequested]);

  const loadConvocatorias = async () => {
    if (contract) {
      try {
        // Cambiar nextId a obtenerTotalConvocatorias
        const convocatoriasCount = await contract.methods.obtenerTotalConvocatorias().call();
        const convocatoriasData: Convocatoria[] = [];

        console.log(`Número total de convocatorias: ${convocatoriasCount}`);

        for (let i = 0; i <= convocatoriasCount - 1; i++) {
          const convocatoria = await contract.methods.obtenerConvocatoria(i).call();
          convocatoriasData.push(convocatoria);

          console.log(`Convocatoria ${i}:`, convocatoria);
        }

        setConvocatorias(convocatoriasData);
      } catch (error) {
        console.error('Error al cargar las convocatorias:', error);
      }
    }
};


  useEffect(() => {
    if (contract) {
      loadConvocatorias();
    }
  }, [contract]);

  return (
    <div className="p-4 bg-gray-900 rounded-xl fade-in">
      <h2 className="text-3xl font-bold mb-4">Lista de Convocatorias</h2>
      <ul className="list-disc list-inside">
        {convocatorias.map((convocatoria, index) => (
          <li key={index} className="mb-2">
            <strong>{convocatoria.titulo}</strong> - {convocatoria.descripcion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConvocatoriaList;
