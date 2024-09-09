import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { FormData, FormDataKey, NestedFormDataKey } from '../../../interfaces/formDataInterfaces';
import ConvocatoriaDetails from './ConvocatoriaDetails';
import Requisitos from './Requisitos';
import DocumentosRequeridos from './DocumentosRequeridos';
import ProcesoSeleccion from './ProcesoSeleccion';
import CondicionesLaborales from './CondicionesLaborales';
import LugarTrabajo from './LugarTrabajo';
import FechasImportantes from './FechasImportantes';
import ConvocatoriaABI from '../../abis/ConvocatoriaABI.json';  // <--- ABI Importada

interface NewConvocatoriaFormProps {
  closeModal: () => void;
}

const NewConvocatoriaForm: React.FC<NewConvocatoriaFormProps> = ({ closeModal }) => {
  const [formData, setFormData] = useState<FormData>({
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
  });

  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [accountsRequested, setAccountsRequested] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // Dirección del contrato

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum && !accountsRequested) {
        const web3Instance = new Web3(window.ethereum as any);
        setWeb3(web3Instance);

        // Usamos la ABI importada desde el archivo JSON
        const contractInstance = new web3Instance.eth.Contract(ConvocatoriaABI.abi, contractAddress);
        setContract(contractInstance);

        try {
          setAccountsRequested(true);
          await window.ethereum.request?.({ method: 'eth_requestAccounts' });
        } catch (error: any) {
          if (error.code === -32002) {
            console.warn("MetaMask ya está procesando una solicitud de cuentas. Por favor espera.");
          } else {
            console.error("Error al solicitar cuentas de MetaMask:", error);
          }
        }
      } else if (!window.ethereum) {
        alert('MetaMask no está instalado. Por favor, instala MetaMask para usar esta aplicación.');
      }
    };

    initializeWeb3();
  }, [accountsRequested]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const [section, key] = name.split('.') as [FormDataKey, NestedFormDataKey];

    if (section === 'documentosRequeridos' || section === 'procesoSeleccion') {
      setFormData(prevState => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          [key]: checked
        }
      }));
    }
  };

  // Función para validar el formulario y enviar los datos
  const handleSave = () => {
    if (!formData.titulo || !formData.descripcion || !formData.formacionAcademica || !formData.experienciaLaboral ||
      !formData.habilidadesTecnicas || !formData.competencias || !formData.lugarTrabajo) {
      setError('Todos los campos de texto deben completarse.');
      return;
    }

    if (!formData.fechasImportantes.inicioConvocatoria || !formData.fechasImportantes.cierreConvocatoria ||
      !formData.fechasImportantes.fechaEvaluacion || !formData.fechasImportantes.publicacionResultados) {
      setError('Debe completar todas las fechas importantes.');
      return;
    }

    if (formData.fechasImportantes.inicioConvocatoria > formData.fechasImportantes.cierreConvocatoria) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    if (!formData.documentosRequeridos.cv || !formData.documentosRequeridos.dni) {
      setError('Debe seleccionar CV y DNI como documentos requeridos.');
      return;
    }

    if (!formData.condicionesLaborales.tipoContrato || !formData.condicionesLaborales.salario || !formData.condicionesLaborales.jornadaLaboral) {
      setError('Debe completar todas las condiciones laborales.');
      return;
    }

    if (!formData.procesoSeleccion.evaluacionCurricular || !formData.procesoSeleccion.entrevistaPersonal) {
      setError('Debe seleccionar la evaluación curricular y la entrevista personal como parte del proceso de selección.');
      return;
    }

    console.log("Datos de la Convocatoria:", formData);
    setError(null);

    handleSaveFechasImportantes();
  };

  const handleSaveFechasImportantes = async () => {
    if (contract && web3) {
      try {
        const accounts = await web3.eth.getAccounts();
        await await contract.methods.crearConvocatoria(
          formData.titulo,
          formData.descripcion,
          formData.formacionAcademica,
          formData.experienciaLaboral,
          formData.habilidadesTecnicas,
          formData.competencias,
          formData.documentosRequeridos.cv,
          formData.documentosRequeridos.dni,
          formData.documentosRequeridos.certificadosEstudios,
          formData.documentosRequeridos.certificadosTrabajo,
          formData.documentosRequeridos.declaracionJurada,
          formData.procesoSeleccion.evaluacionCurricular,
          formData.procesoSeleccion.entrevistaPersonal,
          formData.procesoSeleccion.evaluacionTecnica,
          formData.procesoSeleccion.evaluacionPsicologica,
          formData.condicionesLaborales.tipoContrato,
          formData.condicionesLaborales.salario,
          formData.condicionesLaborales.jornadaLaboral,
          formData.fechasImportantes.inicioConvocatoria,
          formData.fechasImportantes.cierreConvocatoria,
          formData.fechasImportantes.fechaEvaluacion,
          formData.fechasImportantes.publicacionResultados,
          formData.lugarTrabajo
        ).send({ from: accounts[0] });

        closeModal();
      } catch (error) {
        console.error("Error al enviar la transacción:", error);
      }
    } else {
      console.error("El contrato o web3 no están inicializados.");
    }
  };

  // Definir funciones de guardado para cada paso
  const handleSaveConvocatoriaDetails = () => setStep(2);
  const handleSaveRequisitos = () => setStep(3);
  const handleSaveDocumentosRequeridos = () => setStep(4);
  const handleSaveProcesoSeleccion = () => setStep(5);
  const handleSaveCondicionesLaborales = () => setStep(6);
  const handleSaveLugarTrabajo = () => setStep(7);

  return (
    <div className="p-4 bg-gray-900 rounded-xl fade-in">
      <h2 className="text-3xl font-bold mb-4">Nueva Convocatoria</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {step === 1 && (
        <ConvocatoriaDetails
          formData={formData}
          handleChange={handleChange}
          onSave={handleSaveConvocatoriaDetails}
        />
      )}
      {step === 2 && (
        <Requisitos
          formData={formData}
          handleChange={handleChange}
          onSave={handleSaveRequisitos}
        />
      )}
      {step === 3 && (
        <DocumentosRequeridos
          formData={formData}
          handleCheckboxChange={handleCheckboxChange}
          onSave={handleSaveDocumentosRequeridos}
        />
      )}
      {step === 4 && (
        <ProcesoSeleccion
          formData={formData}
          handleCheckboxChange={handleCheckboxChange}
          onSave={handleSaveProcesoSeleccion}
        />
      )}
      {step === 5 && (
        <CondicionesLaborales
          formData={formData.condicionesLaborales}
          handleChange={(e) => {
            const { name, value } = e.target;
            setFormData(prevState => ({
              ...prevState,
              condicionesLaborales: {
                ...prevState.condicionesLaborales,
                [name]: value
              }
            }));
          }}
          onSave={handleSaveCondicionesLaborales}
        />
      )}
      {step === 6 && (
        <LugarTrabajo
          formData={formData}
          handleChange={handleChange}
          onSave={handleSaveLugarTrabajo}
        />
      )}
      {step === 7 && (
        <FechasImportantes
          formData={formData}
          setFormData={setFormData}  // Pasamos setFormData en lugar de handleChange
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default NewConvocatoriaForm;
