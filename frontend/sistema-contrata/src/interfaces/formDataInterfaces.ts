export interface CondicionesLaboralesData {
  tipoContrato: string;
  salario: string;
  jornadaLaboral: string;
}

export interface DocumentosRequeridos {
  cv: boolean;
  dni: boolean;
  certificadosEstudios?: boolean; // Opcional
  certificadosTrabajo?: boolean; // Opcional
  declaracionJurada?: boolean; // Opcional
}

export interface ProcesoSeleccion {
  evaluacionCurricular: boolean;
  entrevistaPersonal: boolean;
  evaluacionTecnica?: boolean; // Opcional
  evaluacionPsicologica?: boolean; // Opcional
}

export interface FechasImportantes {
  inicioConvocatoria: string;
  cierreConvocatoria: string;
  fechaEvaluacion: string;
  publicacionResultados: string;
}

export interface FormData {
  titulo: string;
  descripcion: string;
  formacionAcademica: string;
  experienciaLaboral: string;
  habilidadesTecnicas: string;
  competencias: string;

  documentosRequeridos: DocumentosRequeridos;
  procesoSeleccion: ProcesoSeleccion;
  condicionesLaborales: CondicionesLaboralesData;
  lugarTrabajo: string;
  otroLugarTrabajo?: string; // Se mantiene para manejar la opción "Otros"
  fechasImportantes: FechasImportantes;
}

// Definir tipos de índice para DocumentosRequeridos y ProcesoSeleccion
export type FormDataKey = keyof FormData;
export type NestedFormDataKey = keyof DocumentosRequeridos | keyof ProcesoSeleccion;
