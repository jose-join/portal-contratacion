import request from 'supertest';
import app from '../../../backend/server';
import { queryDocsByField } from '../../../backend/services/firebaseService';

// Mock de Firebase
jest.mock('../../../backend/services/firebaseService', () => ({
    queryDocsByField: jest.fn(),
}));

jest.mock('../../../backend/services/storageService', () => ({
    subirDocumento: jest.fn().mockImplementation((file, path) => {
        console.log(`Mock subirDocumento called with path: ${path}`);
        return Promise.resolve('mockedDocumentUrl');
    }),
}));

jest.mock('../../../backend/middlewares/authMiddleware', () => ({
    authMiddleware: (req: any, res: any, next: Function) => {
        if (req.headers.authorization === 'Bearer invalidToken') {
            // Simula que el token es inválido, entonces no hay userId
            return res.status(400).json({ message: 'No se encontró el ID del postulante' });
        }
        req.user = { userId: 'testPostulante' }; // Simula autenticación correcta
        next();
    },
}));

jest.mock('../../../backend/middlewares/authorizeRole', () => ({
    authorizeRole: () => (req: any, res: any, next: Function) => {
        req.user = { userId: 'testPostulante' }; // Simula autenticación de un postulante
        next();
    },
}));
let webSocketConnection: any; 
// Después de que todas las pruebas hayan terminado, asegúrate de cerrar el WebSocket
afterAll(() => {
    if (webSocketConnection) {
        webSocketConnection.close();
    }
});
jest.mock('../../../backend/services/blockchainService', () => ({
    escucharEventos: jest.fn(),
    detenerWebSocket: jest.fn(() => {
        if (webSocketConnection) {
            webSocketConnection.close();
        }
    }),
}));

describe('GET /api/postulante/ver-postulacion/:idConvocatoria', () => {
    it('Debería devolver "postulado: true" si el postulante ya se ha postulado', async () => {
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            docs: [{ data: () => ({ idPostulante: 'testPostulante' }) }]
        });

        const response = await request(app)
            .get('/api/postulante/ver-postulacion/convocatoria123')
            .set('Authorization', 'Bearer postulanteToken');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('postulado', true);
    });

    it('Debería devolver "postulado: false" si el postulante no se ha postulado', async () => {
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({ docs: [] });

        const response = await request(app)
            .get('/api/postulante/ver-postulacion/convocatoria123')
            .set('Authorization', 'Bearer postulanteToken');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('postulado', false);
    });
});
