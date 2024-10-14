import request from 'supertest';
import app from '../../../backend/server';
import { queryDocsByField } from '../../../backend/services/firebaseService';

// Mock de Firebase
jest.mock('../../../backend/services/firebaseService', () => ({
    queryDocsByField: jest.fn(),
}));

jest.mock('../../../backend/middlewares/authorizeRole', () => ({
    authorizeRole: () => (req: any, res: any, next: Function) => {
        req.user = { userId: 'testPostulante' }; // Simula autenticación de un postulante
        next();
    },
}));
jest.mock('../../../backend/middlewares/authMiddleware', () => ({
    authMiddleware: (req: any, res: any, next: Function) => {
        if (req.headers.authorization !== 'Bearer postulanteToken') {
            // Simula que el token es inválido si no es 'Bearer postulanteToken'
            return res.status(401).json({ message: 'No autorizado, token inválido' });
        }
        req.user = { userId: 'testPostulante' }; // Simula un token válido
        next();
    },
}));
let webSocketConnection: WebSocket | null = null as WebSocket | null;

jest.mock('../../../backend/services/blockchainService', () => ({
    escucharEventos: jest.fn(),
    detenerWebSocket: jest.fn(() => {
        if (webSocketConnection) {
            webSocketConnection.close();
        }
    }),
}));


describe('GET /api/postulante/obtener-documentos', () => {
    it('Debería devolver los documentos del postulante', async () => {
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            empty: false,
            docs: [{ data: () => ({ cvUrl: 'mockCvUrl', dniUrl: 'mockDniUrl' }) }]
        });

        const response = await request(app)
            .get('/api/postulante/obtener-documentos')
            .set('Authorization', 'Bearer postulanteToken');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('cv', 'mockCvUrl');
        expect(response.body).toHaveProperty('dni', 'mockDniUrl');
    });

    it('Debería devolver un mensaje si no se encontraron documentos', async () => {
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({ empty: true });

        const response = await request(app)
            .get('/api/postulante/obtener-documentos')
            .set('Authorization', 'Bearer postulanteToken');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'No se encontraron documentos subidos.');
    });
});
