import request from 'supertest';
import app from '../../../backend/server';
import { queryDocsByField, createDoc, updateDocById } from '../../../backend/services/firebaseService';
import { subirDocumento } from '../../../backend/services/documentUploadService'; // Simula la subida de documentos

// Mock de Firebase y subida de documentos
jest.mock('../../../backend/services/firebaseService', () => ({
    queryDocsByField: jest.fn(),
    createDoc: jest.fn(),
    updateDocById: jest.fn(),
}));

// Aquí simulamos la subida de documentos en lugar de usar Firebase real
jest.mock('../../../backend/services/documentUploadService', () => ({
    subirDocumento: jest.fn().mockResolvedValue('mockedDocumentUrl'),  // Simula la subida de documentos
}));

// Mock de middleware de autenticación y autorización
jest.mock('../../../backend/middlewares/authMiddleware', () => ({
    authMiddleware: (req: any, res: any, next: Function) => {
        req.user = { userId: 'testPostulante' }; // Simula autenticación válida
        next();
    },
}));

jest.mock('../../../backend/middlewares/authorizeRole', () => ({
    authorizeRole: () => (req: any, res: any, next: Function) => {
        req.user = { userId: 'testPostulante' }; // Simula autorización válida
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

describe('POST /api/postulante/subir-documentos', () => {
    it('Debería subir documentos nuevos y crear el documento en Firestore', async () => {
        // Simula que no existen documentos previamente subidos
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({ empty: true });
        
        // Simula la función de subida de documentos
        (subirDocumento as jest.Mock)
            .mockResolvedValueOnce('mockCvUrl') // Para el CV
            .mockResolvedValueOnce('mockDniUrl'); // Para el DNI

        const response = await request(app)
            .post('/api/postulante/subir-documentos')
            .set('Authorization', 'Bearer postulanteToken')
            .attach('cv', Buffer.from('file content'), 'cv.pdf') // Simula el archivo de CV
            .attach('dni', Buffer.from('file content'), 'dni.pdf'); // Simula el archivo de DNI

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Documentos subidos con éxito.');
        expect(response.body.documentosSubidos).toHaveProperty('cvUrl', 'mockCvUrl');
        expect(response.body.documentosSubidos).toHaveProperty('dniUrl', 'mockDniUrl');
        expect(createDoc).toHaveBeenCalled(); // Verifica que se creó el documento
    });

    it('Debería actualizar los documentos existentes en Firestore', async () => {
        // Simula que ya existen documentos subidos previamente
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            empty: false,
            docs: [{ id: 'existingDocId' }],
        });

        // Simula la función de subida de documentos
        (subirDocumento as jest.Mock).mockResolvedValueOnce('mockCvUrlUpdated'); // Para el CV

        const response = await request(app)
            .post('/api/postulante/subir-documentos')
            .set('Authorization', 'Bearer postulanteToken')
            .attach('cv', Buffer.from('file content'), 'cv.pdf'); // Simula el archivo de CV

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Documentos actualizados con éxito.');
        expect(updateDocById).toHaveBeenCalledWith('documentosPostulantes', 'existingDocId', expect.any(Object));
    });

    it('Debería devolver un error si no se suben documentos', async () => {
        const response = await request(app)
            .post('/api/postulante/subir-documentos')
            .set('Authorization', 'Bearer postulanteToken');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Debes subir al menos un documento.');
    });
});
