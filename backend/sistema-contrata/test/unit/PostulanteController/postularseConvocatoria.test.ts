import request from 'supertest';
import app from '../../../backend/server';
import { getDocById, queryDocsByFields, queryDocsByField, createDoc } from '../../../backend/services/firebaseService';

// Mock de Firebase
jest.mock('../../../backend/services/firebaseService', () => ({
    getDocById: jest.fn(),
    queryDocsByFields: jest.fn(),
    queryDocsByField: jest.fn(),
    createDoc: jest.fn(),
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

describe('POST /api/postulante/postular/:idConvocatoria', () => {
    it('Debería permitir postularse a una convocatoria si se han subido los documentos', async () => {
        const mockIdConvocatoria = 'convocatoria123';
        const mockConvocatoria = {
            titulo: 'Convocatoria de Prueba',
            documentosRequeridos: { cv: true, dni: true },
        };

        (getDocById as jest.Mock).mockResolvedValueOnce({
            exists: () => true,
            data: () => mockConvocatoria,
        });
        (queryDocsByFields as jest.Mock).mockResolvedValueOnce({ empty: true });
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            empty: false,
            docs: [{ data: () => ({ cvUrl: 'mockCvUrl', dniUrl: 'mockDniUrl' }) }],
        });

        const response = await request(app)
            .post(`/api/postulante/postular/${mockIdConvocatoria}`)
            .set('Authorization', 'Bearer postulanteToken');

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Postulación realizada con éxito');
    });

    it('Debería devolver un error si faltan documentos', async () => {
        const mockIdConvocatoria = 'convocatoria123';
        const mockConvocatoria = {
            titulo: 'Convocatoria de Prueba',
            documentosRequeridos: { cv: true, dni: true },
        };
    
        (getDocById as jest.Mock).mockResolvedValueOnce({
            exists: () => true, // Asegura que la convocatoria sea encontrada
            data: () => mockConvocatoria,
        });
    
        // Mock para simular que la postulación no existe
        (queryDocsByFields as jest.Mock).mockResolvedValueOnce({
            empty: true,  // Asegúrate de que `empty` esté definido
        });
    
        // Mock para simular que solo un documento está subido (el DNI falta)
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            empty: false,
            docs: [{ data: () => ({ cvUrl: 'mockCvUrl' }) }],
        });
    
        const response = await request(app)
            .post(`/api/postulante/postular/${mockIdConvocatoria}`)
            .set('Authorization', 'Bearer postulanteToken');
    
        expect(response.status).toBe(400);  // Esperamos un 400 cuando faltan documentos
        expect(response.body).toHaveProperty('message', expect.stringContaining('Faltan los siguientes documentos'));
    });
    
    
});
