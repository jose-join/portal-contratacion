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
    otroLugarTrabajo?: string;
    fechasImportantes: FechasImportantes;
  }
  
  export interface DocumentosRequeridos {
    cv: boolean;
    dni: boolean;
    certificadosEstudios?: boolean;
    certificadosTrabajo?: boolean;
    declaracionJurada?: boolean;
  }
  
  export interface ProcesoSeleccion {
    evaluacionCurricular: boolean;
    entrevistaPersonal: boolean;
    evaluacionTecnica?: boolean;
    evaluacionPsicologica?: boolean;
  }
  
  export interface CondicionesLaboralesData {
    tipoContrato: string;
    salario: string;
    jornadaLaboral: string;
  }
  
  export interface FechasImportantes {
    inicioConvocatoria: string;
    cierreConvocatoria: string;
    fechaEvaluacion: string;
    publicacionResultados: string;
  }
  
  export type FormDataKey = keyof FormData;
  export type NestedFormDataKey = keyof DocumentosRequeridos | keyof ProcesoSeleccion;
  