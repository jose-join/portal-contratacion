import React, { useState } from 'react';
import axios from 'axios';
import { FormData, FormDataKey, NestedFormDataKey } from '../../../interfaces/formDataInterfaces';
import ConvocatoriaDetails from './ConvocatoriaDetails';
import Requisitos from './Requisitos';
import DocumentosRequeridos from './DocumentosRequeridos';
import ProcesoSeleccion from './ProcesoSeleccion';
import CondicionesLaborales from './CondicionesLaborales';
import LugarTrabajo from './LugarTrabajo';
import FechasImportantes from './FechasImportantes';

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
    },
  });

  const [step, setStep] = useState<number>(1); // Control del paso actual
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const [section, key] = name.split('.') as [FormDataKey, NestedFormDataKey];

    if (section === 'documentosRequeridos' || section === 'procesoSeleccion') {
      setFormData((prevState) => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          [key]: checked,
        },
      }));
    }
  };

  // Función para validar el formulario y enviar los datos al backend
  const handleSave = async () => {
    // Validar campos obligatorios
    if (
      !formData.titulo ||
      !formData.descripcion ||
      !formData.formacionAcademica ||
      !formData.experienciaLaboral ||
      !formData.habilidadesTecnicas ||
      !formData.competencias ||
      !formData.lugarTrabajo
    ) {
      setError('Todos los campos de texto deben completarse.');
      return;
    }

    if (
      !formData.fechasImportantes.inicioConvocatoria ||
      !formData.fechasImportantes.cierreConvocatoria ||
      !formData.fechasImportantes.fechaEvaluacion ||
      !formData.fechasImportantes.publicacionResultados
    ) {
      setError('Debe completar todas las fechas importantes.');
      return;
    }

    if (formData.fechasImportantes.inicioConvocatoria > formData.fechasImportantes.cierreConvocatoria) {
      setError('La fecha de inicio no puede ser posterior a la fecha de cierre.');
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

    setError(null);

    try {
      // Llamada al backend para crear la nueva convocatoria
      const response = await axios.post('http://localhost:3000/api/convocatoria', formData, {
        headers: {
          'x-auth-token': localStorage.getItem('token') || '', // Asegúrate de enviar el token
        },
      });

      if (response.status === 200) {
        console.log('Convocatoria creada con éxito:', response.data);
        closeModal(); // Cerrar el modal si es exitoso
      } else {
        console.error('Error al crear la convocatoria:', response.data);
        setError('Error al crear la convocatoria.');
      }
    } catch (error) {
      console.error('Error al hacer la solicitud al backend:', error);
      setError('Error al hacer la solicitud al backend.');
    }
  };

  // Funciones de guardado para cada paso del formulario
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
            setFormData((prevState) => ({
              ...prevState,
              condicionesLaborales: {
                ...prevState.condicionesLaborales,
                [name]: value,
              },
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
          setFormData={setFormData} // Pasamos setFormData en lugar de handleChange
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default NewConvocatoriaForm;
