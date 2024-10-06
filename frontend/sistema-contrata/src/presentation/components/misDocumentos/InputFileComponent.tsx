import React, { useState } from 'react';

interface InputFileComponentProps {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  fileName: string;  // La URL completa del archivo
  isUploaded: boolean;
  onDelete?: () => void;
  onUploadOrUpdate?: () => void;  // Subir o Actualizar
}

// Función que extrae el nombre del archivo de una URL codificada
const extractFileName = (url: string): string => {
  const decodedUrl = decodeURIComponent(url);  // Decodificar la URL
  return decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1).split('?')[0];  // Extraer el nombre
};

const InputFileComponent: React.FC<InputFileComponentProps> = ({
  label,
  accept,
  onChange,
  fileName,
  isUploaded,
  onDelete,
  onUploadOrUpdate,
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string>(''); // Estado para almacenar el nombre del archivo seleccionado

  return (
    <div className="mb-4 w-full max-w-md"> {/* Ajusta el ancho máximo del contenedor */}
      <label className="block text-lg font-semibold mb-2 text-white">{label}:</label>

      <div className="flex items-center space-x-3">
        {/* Icono de clip para seleccionar el archivo */}
        <label className="cursor-pointer bg-gray-600 hover:bg-gray-700 text-white py-2 px-2 rounded flex items-center">
          <i className="fa-solid fa-paperclip text-xl"></i>
          <input
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : null;
              onChange(file); // Actualiza el archivo seleccionado
              if (file) {
                setSelectedFileName(file.name); // Almacenar el nombre del archivo seleccionado
              }
            }}
            className="hidden"
          />
        </label>
        {/* Cuadro reducido para mostrar el nombre del archivo */}
        <div className="border p-2 rounded w-full truncate"> {/* Ajuste del ancho para que se adapte */}
          {selectedFileName || (isUploaded ? extractFileName(fileName) : '')}
        </div>
      </div>

      {isUploaded ? (
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mt-2">
          <p className="text-green-500 mb-2 sm:mb-0">
            Documento subido: {extractFileName(fileName)}
          </p>
          <div className="flex space-x-3">
            {onDelete && (
              <button
                type="button"
                className="text-red-500 underline hover:text-red-700 flex items-center"
                onClick={onDelete}
              >
                <i className="fa-solid fa-trash mr-1"></i> Eliminar
              </button>
            )}
            {onUploadOrUpdate && (
              <button
                type="button"
                className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 flex items-center"
                onClick={onUploadOrUpdate}
              >
                <i className="fa-solid fa-arrow-up-from-bracket mr-1"></i> Actualizar
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mt-2">
          {onUploadOrUpdate && (
            <button
              type="button"
              className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 flex items-center"
              onClick={onUploadOrUpdate}
            >
              <i className="fa-solid fa-upload mr-1"></i> Subir
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InputFileComponent;
