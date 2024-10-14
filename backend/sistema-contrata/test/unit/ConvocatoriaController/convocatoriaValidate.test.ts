import request from 'supertest';
import app from '../../../backend/server';
import { getDocById, updateDocById } from '../../../backend/services/firebaseService';


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
    if (webSocketConnection) {
        webSocketConnection.close();
    }
});


describe('PUT /api/convocatoria/validar/:id', () => {
    it('Debería devolver un error si la convocatoria ya ha sido subida a la blockchain', async () => {
        const mockId = 'convocatoria123';

        (getDocById as jest.Mock).mockResolvedValueOnce({
            data: () => ({ subidoBlockchain: true })
        });

        const response = await request(app)
            .put(`/api/convocatoria/validar/${mockId}`)
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'La convocatoria ya ha sido subida a la blockchain.');
    });

    it('Debería devolver un error si ocurre un problema al validar la convocatoria', async () => {
        const mockId = 'convocatoria123';

        (getDocById as jest.Mock).mockRejectedValueOnce(new Error('Error al obtener la convocatoria'));

        const response = await request(app)
            .put(`/api/convocatoria/validar/${mockId}`)
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error al validar la convocatoria');
        expect(response.body).toHaveProperty('details', 'Error al obtener la convocatoria');
    });
});
