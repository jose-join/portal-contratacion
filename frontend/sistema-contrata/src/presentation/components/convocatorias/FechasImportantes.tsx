import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { FormData } from '../../../interfaces/formDataInterfaces';
import { format } from 'date-fns'; // Importa la función de formateo

interface FechasImportantesProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSave: () => void;
}

const FechasImportantesComponent: React.FC<FechasImportantesProps> = ({ formData, setFormData, onSave }) => {
  const [error, setError] = useState<string | null>(null);

  // Función para manejar el cambio de fechas
  const handleDateChange = (field: keyof FormData['fechasImportantes'], date: Date | null) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd'); // Utiliza date-fns para formatear la fecha correctamente
      console.log(`Campo: ${field}, Valor: ${formattedDate}`); // Para verificar el valor que se está enviando

      // Actualiza el estado de formData directamente usando setFormData
      setFormData((prevFormData) => ({
        ...prevFormData,
        fechasImportantes: {
          ...prevFormData.fechasImportantes,
          [field]: formattedDate,
        },
      }));
    } else {
      // Si no hay fecha, enviamos una cadena vacía
      setFormData((prevFormData) => ({
        ...prevFormData,
        fechasImportantes: {
          ...prevFormData.fechasImportantes,
          [field]: '',
        },
      }));
    }
  };

  // Función para manejar el guardado de fechas
  const handleSave = () => {
    const { inicioConvocatoria, cierreConvocatoria, fechaEvaluacion, publicacionResultados } = formData.fechasImportantes;

    console.log("Estado de fechas antes de guardar:", formData.fechasImportantes);
    // Validación de que todas las fechas se hayan seleccionado
    if (!inicioConvocatoria || !cierreConvocatoria || !fechaEvaluacion || !publicacionResultados) {
      setError('Debe seleccionar todas las fechas.');
      return;
    }

    // Validar que las fechas tengan coherencia lógica
    if (inicioConvocatoria > cierreConvocatoria) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    setError(null);
    onSave(); // Guardamos la convocatoria
  };

  return (
    <div className="mb-4">
      <h3 className="text-2xl font-bold mb-4" style={{ color: 'white' }}>Fechas de Convocatoria</h3>

      {/* Campo para la fecha de inicio de convocatoria */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DatePicker
          label="Fecha de inicio"
          value={formData.fechasImportantes.inicioConvocatoria ? new Date(formData.fechasImportantes.inicioConvocatoria) : null}
          onChange={(date) => handleDateChange('inicioConvocatoria', date)}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: "outlined",
              InputLabelProps: {
                style: { color: 'white' },
              },
              InputProps: {
                style: {
                  color: 'white',
                  backgroundColor: '#333',
                  borderColor: 'white',
                  height: '40px',
                },
              },
              sx: {
                marginBottom: '20px',
                width: '300px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'lightgray',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'lightblue',
                  },
                },
              },
            },
          }}
        />
      </LocalizationProvider>

      {/* Campo para la fecha de fin de convocatoria */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DatePicker
          label="Fecha de fin"
          value={formData.fechasImportantes.cierreConvocatoria ? new Date(formData.fechasImportantes.cierreConvocatoria) : null}
          onChange={(date) => handleDateChange('cierreConvocatoria', date)}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: "outlined",
              InputLabelProps: {
                style: { color: 'white' },
              },
              InputProps: {
                style: {
                  color: 'white',
                  backgroundColor: '#333',
                  borderColor: 'white',
                  height: '40px',
                },
              },
              sx: {
                marginBottom: '20px',
                width: '300px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'lightgray',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'lightblue',
                  },
                },
              },
            },
          }}
        />
      </LocalizationProvider>

      {/* Campo para la fecha de evaluación */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DatePicker
          label="Fecha de Evaluación"
          value={formData.fechasImportantes.fechaEvaluacion ? new Date(formData.fechasImportantes.fechaEvaluacion) : null}
          onChange={(date) => handleDateChange('fechaEvaluacion', date)}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: "outlined",
              InputLabelProps: {
                style: { color: 'white' },
              },
              InputProps: {
                style: {
                  color: 'white',
                  backgroundColor: '#333',
                  borderColor: 'white',
                  height: '40px',
                },
              },
              sx: {
                marginBottom: '20px',
                width: '300px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'lightgray',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'lightblue',
                  },
                },
              },
            },
          }}
        />
      </LocalizationProvider>

      {/* Campo para la fecha de publicación de resultados */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DatePicker
          label="Fecha de Publicación de Resultados"
          value={formData.fechasImportantes.publicacionResultados ? new Date(formData.fechasImportantes.publicacionResultados) : null}
          onChange={(date) => handleDateChange('publicacionResultados', date)}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: "outlined",
              InputLabelProps: {
                style: { color: 'white' },
              },
              InputProps: {
                style: {
                  color: 'white',
                  backgroundColor: '#333',
                  borderColor: 'white',
                  height: '40px',
                },
              },
              sx: {
                marginBottom: '20px',
                width: '300px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'lightgray',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'lightblue',
                  },
                },
              },
            },
          }}
        />
      </LocalizationProvider>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Botón finalizado */}
      <button onClick={handleSave} className="mt-4 btn-primary" style={{ width: '300px' }}>
        Guardar y Finalizar
      </button>
    </div>
  );
};

export default FechasImportantesComponent;
