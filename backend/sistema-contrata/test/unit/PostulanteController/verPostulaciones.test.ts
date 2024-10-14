import request from 'supertest';
import app from '../../../backend/server';
import { queryDocsByField, getDocById } from '../../../backend/services/firebaseService'; // Mock de Firebase

jest.mock('../../../backend/services/firebaseService', () => ({
    queryDocsByField: jest.fn(),
    getDocById: jest.fn(),
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
        req.user = { userId: 'testPostulante' }; // Simula autorización
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

describe('GET /api/postulante/ver-postulaciones', () => {
    it('Debería devolver todas las postulaciones de un postulante', async () => {
        const mockPostulaciones = [
            {
                id: '1',
                idConvocatoria: 'convocatoria123',
                estado: 'en proceso',
            }
        ];

        // Mock de la función queryDocsByField
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            docs: mockPostulaciones.map((postulacion) => ({ id: postulacion.id, data: () => postulacion })),
        });

        // Mock de la función getDocById para simular un documento con exists true
        (getDocById as jest.Mock).mockResolvedValueOnce({
            exists: () => true, // Asegúrate de que exista el método exists
            data: () => ({ titulo: 'Convocatoria de Prueba' }), // Devuelve los datos simulados de la convocatoria
        });

        const response = await request(app)
            .get('/api/postulante/ver-postulaciones')
            .set('Authorization', 'Bearer postulanteToken');

        console.log('Response body:', response.body);

        expect(response.status).toBe(200);
        expect(response.body.postulaciones[0]).toHaveProperty('nombreConvocatoria', 'Convocatoria de Prueba');
    });

    it('Debería devolver un error si no se encuentra el ID del postulante', async () => {
        // Aquí puedes simular que no se encuentran documentos para el postulante
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            docs: [], // No hay documentos de postulaciones
        });
    
        const response = await request(app)
            .get('/api/postulante/ver-postulaciones')
            .set('Authorization', 'Bearer invalidToken');
    
        console.log('Response body:', response.body);
    
        expect(response.status).toBe(400); // Esperamos un 400 porque no se encontró el ID del postulante
        expect(response.body).toHaveProperty('message', 'No se encontró el ID del postulante');
    });
});
