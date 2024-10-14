import request from 'supertest';
import app from '../../../backend/server';
import { createDoc } from '../../../backend/services/firebaseService';


jest.mock('../../../backend/services/firebaseService', () => ({
    createDoc: jest.fn(),
    getDocById: jest.fn(),
    updateDocById: jest.fn(),
    getAllDocs: jest.fn(),
}));

jest.mock('../../../backend/middlewares/authorizeRole', () => ({
    authorizeRole: () => (req: Request, res: Response, next: Function) => {
        (req as any).user = { role: 'admin' };
        next();
    },
}));
jest.mock('../../../backend/services/blockchainService', () => ({
    escucharEventos: jest.fn(),
    detenerWebSocket: jest.fn(() => {
        if (webSocketConnection) {
            webSocketConnection.close();
        }
    }),
}));
let webSocketConnection: WebSocket | undefined;

afterAll(() => {
    // Asegúrate de cerrar cualquier conexión WebSocket
    if (webSocketConnection) {
        webSocketConnection.close();
    }
});


describe('POST /api/convocatoria', () => {
    it('Debería crear una convocatoria correctamente con todos los datos requeridos', async () => {
        const convocatoriaData = {
            titulo: 'Convocatoria de Prueba',
            descripcion: 'Esta es una convocatoria de prueba.',
            formacionAcademica: 'Ingeniería de Sistemas',
            experienciaLaboral: '5 años de experiencia en desarrollo de software',
            habilidadesTecnicas: 'JavaScript, Node.js, React',
            competencias: 'Trabajo en equipo, Proactividad',
            documentosRequeridos: {
                cv: true,
                dni: true,
                certificadosEstudios: true,
                certificadosTrabajo: false,
                declaracionJurada: true,
            },
            procesoSeleccion: {
                evaluacionCurricular: true,
                entrevistaPersonal: true,
                evaluacionTecnica: true,
                evaluacionPsicologica: false,
            },
            condicionesLaborales: {
                tipoContrato: 'Indeterminado',
                salario: '3000 soles',
                jornadaLaboral: 'Tiempo completo',
            },
            lugarTrabajo: 'Lima, Perú',
            fechasImportantes: {
                inicioConvocatoria: '2024-10-01',
                cierreConvocatoria: '2024-10-10',
                fechaEvaluacion: '2024-10-15',
                publicacionResultados: '2024-10-20',
            },
            subidoBlockchain: false,
            validado: false,
            postulantes: [],
        };

        (createDoc as jest.Mock).mockResolvedValueOnce('mockConvocatoriaId');

        const response = await request(app)
            .post('/api/convocatoria')
            .send(convocatoriaData)
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Convocatoria creada en Firebase con éxito');
        expect(response.body).toHaveProperty('id', 'mockConvocatoriaId');
    });

    it('Debería devolver un error si falla la creación de la convocatoria', async () => {
        (createDoc as jest.Mock).mockRejectedValueOnce(new Error('Error al crear la convocatoria'));

        const convocatoriaData = {
            titulo: 'Convocatoria de Prueba',
            descripcion: 'Esta es una convocatoria de prueba.',
            formacionAcademica: 'Ingeniería de Sistemas',
            experienciaLaboral: '5 años de experiencia en desarrollo de software',
            habilidadesTecnicas: 'JavaScript, Node.js, React',
            competencias: 'Trabajo en equipo, Proactividad',
            documentosRequeridos: {
                cv: true,
                dni: true,
                certificadosEstudios: true,
                certificadosTrabajo: false,
                declaracionJurada: true,
            },
            procesoSeleccion: {
                evaluacionCurricular: true,
                entrevistaPersonal: true,
                evaluacionTecnica: true,
                evaluacionPsicologica: false,
            },
            condicionesLaborales: {
                tipoContrato: 'Indeterminado',
                salario: '3000 soles',
                jornadaLaboral: 'Tiempo completo',
            },
            lugarTrabajo: 'Lima, Perú',
            fechasImportantes: {
                inicioConvocatoria: '2024-10-01',
                cierreConvocatoria: '2024-10-10',
                fechaEvaluacion: '2024-10-15',
                publicacionResultados: '2024-10-20',
            },
            subidoBlockchain: false,
            validado: false,
            postulantes: [],
        };

        const response = await request(app)
            .post('/api/convocatoria')
            .send(convocatoriaData)
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error al crear la convocatoria en Firebase');
    });
});
