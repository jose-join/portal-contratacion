import request from 'supertest';
import app from '../../../backend/server';
import { getDocById, getAllDocs } from '../../../backend/services/firebaseService';


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


describe('GET /api/convocatoria/:id', () => {
    it('Debería mostrar una convocatoria correctamente', async () => {
        const mockId = 'convocatoria123';
        const mockConvocatoria = {
            id: mockId,
            titulo: 'Convocatoria de Prueba',
            descripcion: 'Esta es una convocatoria de prueba',
        };

        (getDocById as jest.Mock).mockResolvedValueOnce(mockConvocatoria);

        const response = await request(app)
            .get(`/api/convocatoria/${mockId}`)
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockConvocatoria);
    });

    it('Debería devolver un error 404 si la convocatoria no se encuentra', async () => {
        const mockId = 'convocatoriaNoExistente';

        (getDocById as jest.Mock).mockRejectedValueOnce(new Error('Convocatoria no encontrada'));

        const response = await request(app)
            .get(`/api/convocatoria/${mockId}`)
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Convocatoria no encontrada');
    });
});

describe('GET /api/convocatoria', () => {
    it('Debería mostrar todas las convocatorias correctamente', async () => {
        const mockConvocatorias = [
            { id: 'convocatoria1', titulo: 'Convocatoria 1', descripcion: 'Descripción 1' },
            { id: 'convocatoria2', titulo: 'Convocatoria 2', descripcion: 'Descripción 2' },
        ];

        (getAllDocs as jest.Mock).mockResolvedValueOnce(mockConvocatorias);

        const response = await request(app)
            .get('/api/convocatoria')
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockConvocatorias);
    });

    it('Debería devolver un error 500 si ocurre un problema al obtener las convocatorias', async () => {
        (getAllDocs as jest.Mock).mockRejectedValueOnce(new Error('Error al obtener las convocatorias'));

        const response = await request(app)
            .get('/api/convocatoria')
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error al obtener las convocatorias');
    });
});
