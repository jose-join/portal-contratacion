export interface CondicionesLaboralesData {
    tipoContrato: string;
    salario: string;
    jornadaLaboral: string;
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
  
  export interface FechasImportantes {
    inicioConvocatoria: string;
    cierreConvocatoria: string;
    fechaEvaluacion: string;
    publicacionResultados: string;
  }
  
  export interface DocumentosSubidos {
    cvUrl: string;
    dniUrl: string;
    certificadosEstudiosUrl?: string;
    certificadosTrabajoUrl?: string;
    declaracionJuradaUrl?: string;
  }
  
  export interface Postulante {
    idPostulante: string;
    documentosSubidos: DocumentosSubidos;
    fechaPostulacion: string;
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
    otroLugarTrabajo?: string;
    fechasImportantes: FechasImportantes;
    subidoBlockchain?: boolean;
    validado?: boolean;
    postulantes?: Postulante[]; // Agregado: lista de postulantes asociados a la convocatoria
  }
  