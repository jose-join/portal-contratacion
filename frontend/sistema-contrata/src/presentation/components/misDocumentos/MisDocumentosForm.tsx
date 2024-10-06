import React, { useState, useEffect } from 'react';
import InputFileComponent from './InputFileComponent';

const MisDocumentosForm: React.FC = () => {
  const [certificadosEstudios, setCertificadosEstudios] = useState<File | null>(null);
  const [certificadosTrabajo, setCertificadosTrabajo] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [declaracionJurada, setDeclaracionJurada] = useState<File | null>(null);
  const [dni, setDni] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [documentosSubidos, setDocumentosSubidos] = useState({
    certificadosEstudios: false,
    certificadosTrabajo: false,
    cv: false,
    declaracionJurada: false,
    dni: false,
  });

  const [fileNames, setFileNames] = useState({
    certificadosEstudios: '',
    certificadosTrabajo: '',
    cv: '',
    declaracionJurada: '',
    dni: '',
  });

  useEffect(() => {
    cargarDocumentosSubidos();
  }, []);

  const cargarDocumentosSubidos = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch('http://localhost:3000/api/postulante/obtener-documentos', {
        method: 'GET',
        headers: {
          'x-auth-token': token,
        },
      });

      const data = await response.json();

      if (response.ok && data) {
        setDocumentosSubidos({
          certificadosEstudios: !!data.certificadosEstudios,
          certificadosTrabajo: !!data.certificadosTrabajo,
          cv: !!data.cv,
          declaracionJurada: !!data.declaracionJurada,
          dni: !!data.dni,
        });

        setFileNames({
          certificadosEstudios: data.certificadosEstudios ? data.certificadosEstudios.split('/').pop() : '',
          certificadosTrabajo: data.certificadosTrabajo ? data.certificadosTrabajo.split('/').pop() : '',
          cv: data.cv ? data.cv.split('/').pop() : '',
          declaracionJurada: data.declaracionJurada ? data.declaracionJurada.split('/').pop() : '',
          dni: data.dni ? data.dni.split('/').pop() : '',
        });
      }
    } catch (error) {
      console.error('Error al cargar los documentos subidos:', error);
    }
  };

  // Función para subir o actualizar los documentos
  const handleUploadOrUpdate = async (docType: string) => {
    const token = localStorage.getItem('token') || '';
    const formData = new FormData();

    // Agregar el archivo correspondiente a formData
    switch (docType) {
      case 'certificadosEstudios':
        if (certificadosEstudios) formData.append('certificadosEstudios', certificadosEstudios);
        break;
      case 'certificadosTrabajo':
        if (certificadosTrabajo) formData.append('certificadosTrabajo', certificadosTrabajo);
        break;
      case 'cv':
        if (cv) formData.append('cv', cv);
        break;
      case 'declaracionJurada':
        if (declaracionJurada) formData.append('declaracionJurada', declaracionJurada);
        break;
      case 'dni':
        if (dni) formData.append('dni', dni);
        break;
      default:
        return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/postulante/subir-documentos', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje('Documentos subidos/actualizados con éxito');
        cargarDocumentosSubidos(); // Recargar los documentos subidos
      } else {
        setMensaje(`Error al subir los documentos: ${data.message}`);
      }
    } catch (error) {
      console.error('Error al subir o actualizar el documento:', error);
      setMensaje('Error al subir el documento');
    }
  };

  return (
    <div className="container mx-auto max-w-5xl p-8 bg-gray-900 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Subir Documentos</h1>

      {mensaje && <p className="text-green-500">{mensaje}</p>}

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputFileComponent
          label="Certificados de Estudios"
          accept=".pdf,.jpg,.png"
          onChange={setCertificadosEstudios}
          fileName={fileNames.certificadosEstudios}
          isUploaded={documentosSubidos.certificadosEstudios}
          onUploadOrUpdate={() => handleUploadOrUpdate('certificadosEstudios')}
        />

        <InputFileComponent
          label="Certificados de Trabajo"
          accept=".pdf,.jpg,.png"
          onChange={setCertificadosTrabajo}
          fileName={fileNames.certificadosTrabajo}
          isUploaded={documentosSubidos.certificadosTrabajo}
          onUploadOrUpdate={() => handleUploadOrUpdate('certificadosTrabajo')}
        />

        <InputFileComponent
          label="Currículum Vitae (CV)"
          accept=".pdf,.doc,.docx"
          onChange={setCv}
          fileName={fileNames.cv}
          isUploaded={documentosSubidos.cv}
          onUploadOrUpdate={() => handleUploadOrUpdate('cv')}
        />

        <InputFileComponent
          label="Declaración Jurada"
          accept=".pdf,.jpg,.png"
          onChange={setDeclaracionJurada}
          fileName={fileNames.declaracionJurada}
          isUploaded={documentosSubidos.declaracionJurada}
          onUploadOrUpdate={() => handleUploadOrUpdate('declaracionJurada')}
        />

        <InputFileComponent
          label="Copia de DNI"
          accept=".pdf,.jpg,.png"
          onChange={setDni}
          fileName={fileNames.dni}
          isUploaded={documentosSubidos.dni}
          onUploadOrUpdate={() => handleUploadOrUpdate('dni')}
        />
      </form>
    </div>
  );
};

export default MisDocumentosForm;
