import request from 'supertest';
import app from '../../../backend/server';
import { getDocById, queryDocsByField } from '../../../backend/services/firebaseService'; // Mock de Firebase

jest.mock('../../../backend/services/firebaseService', () => ({
    getDocById: jest.fn(),
    queryDocsByField: jest.fn(),
}));

jest.mock('../../../backend/middlewares/authorizeRole', () => ({
    authorizeRole: () => (req: Request, res: Response, next: Function) => {
        (req as any).user = { role: 'admin' };
        next();
    },
}));
let webSocketConnection: any; // Declare the variable
jest.mock('../../../backend/services/blockchainService', () => ({
    escucharEventos: jest.fn(),
    detenerWebSocket: jest.fn(() => {
        if (webSocketConnection) {
            webSocketConnection.close();
        }
    }),
}));
afterAll(() => {
    // Cierra cualquier conexión WebSocket activa
    if (webSocketConnection) {
        webSocketConnection.close();
    }
});

describe('GET /api/convocatoria/postulantes/:idConvocatoria', () => {
    it('Debería contar el número de postulantes y devolver los detalles correctamente', async () => {
        const mockIdConvocatoria = 'convocatoria123';
        const mockConvocatoria = {
            titulo: 'Convocatoria de Prueba',
        };

        const mockPostulantes = {
            postulante1: { nombres: 'Juan', apellidos: 'Perez' },
            postulante2: { nombres: 'Ana', apellidos: 'Garcia' },
        };

        // Mock para devolver la convocatoria
        (getDocById as jest.Mock).mockResolvedValueOnce({
            data: () => mockConvocatoria
        });

        // Mock para devolver las postulaciones
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            size: 2,
            docs: [
                {
                    data: () => ({
                        idPostulante: 'postulante1',
                        estado: 'en proceso'
                    })
                },
                {
                    data: () => ({
                        idPostulante: 'postulante2',
                        estado: 'finalizado'
                    })
                }
            ]
        });

        // Mock para devolver los detalles de los postulantes
        (getDocById as jest.Mock).mockImplementation((_, id) => {
            if ((mockPostulantes as any)[id]) {
                return { data: () => (mockPostulantes as any)[id] };
            }
            return { data: () => null };
        });

        // Ejecutar la petición GET
        const response = await request(app)
            .get(`/api/convocatoria/postulantes/${mockIdConvocatoria}`)
            .set('Authorization', 'Bearer adminToken');

        // Verificaciones
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            idConvocatoria: mockIdConvocatoria,
            nombreConvocatoria: mockConvocatoria.titulo,
            numeroPostulantes: 2,
            postulantes: [
                { nombre: 'Juan Perez', estado: 'en proceso' },
                { nombre: 'Ana Garcia', estado: 'finalizado' },
            ],
        });
    });

    it('Debería devolver un error 404 si la convocatoria no existe', async () => {
        const mockIdConvocatoria = 'convocatoriaInexistente';

        // Simula una convocatoria inexistente
        (getDocById as jest.Mock).mockResolvedValueOnce({
            data: () => null
        });

        // Ejecutar la petición GET
        const response = await request(app)
            .get(`/api/convocatoria/postulantes/${mockIdConvocatoria}`)
            .set('Authorization', 'Bearer adminToken');

        // Verificaciones
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Convocatoria no encontrada.');
    });
});
