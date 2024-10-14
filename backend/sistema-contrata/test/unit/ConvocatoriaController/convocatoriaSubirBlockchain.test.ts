import request from 'supertest';
import app from '../../../backend/server';
import { getDocById, updateDocById } from '../../../backend/services/firebaseService'; // Mock de Firebase
import { enviarABlockchain } from '../../../backend/services/blockchainService'; // Mock de Blockchain

// Mock de Firebase y Blockchain
jest.mock('../../../backend/services/firebaseService', () => ({
  getDocById: jest.fn(),
  updateDocById: jest.fn(),
}));

jest.mock('../../../backend/services/blockchainService', () => ({
    escucharEventos: jest.fn(),
    enviarABlockchain: jest.fn(),
}));
jest.mock('../../../backend/middlewares/authorizeRole', () => ({
    authorizeRole: () => (req: Request, res: Response, next: Function) => {
        // Simula que el usuario es un admin
        (req as any).user = { role: 'admin' };
        next();
    }
}));


describe('POST /api/convocatoria/blockchain/:id', () => {
    it('Debería subir una convocatoria a la blockchain si está validada', async () => {
        const mockId = 'convocatoria123';
        const mockConvocatoria = { validado: true, fechasImportantes: {} };

        (getDocById as jest.Mock).mockResolvedValueOnce({ data: () => mockConvocatoria });
        (enviarABlockchain as jest.Mock).mockResolvedValueOnce({ success: true });

        const response = await request(app)
            .post(`/api/convocatoria/blockchain/${mockId}`) // Cambia a POST
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Convocatoria subida a la blockchain con éxito');
        expect(updateDocById).toHaveBeenCalledWith('convocatorias', mockId, { subidoBlockchain: true });
    });

    it('Debería devolver un error si la convocatoria no está validada', async () => {
        const mockId = 'convocatoria123';
        const mockConvocatoria = { validado: false };

        (getDocById as jest.Mock).mockResolvedValueOnce({ data: () => mockConvocatoria });

        const response = await request(app)
            .post(`/api/convocatoria/blockchain/${mockId}`) // Cambia a POST
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'La convocatoria no ha sido validada.');
    });

    it('Debería devolver un error si ocurre un problema en la blockchain', async () => {
        const mockId = 'convocatoria123';
        const mockConvocatoria = { validado: true, fechasImportantes: {} };

        (getDocById as jest.Mock).mockResolvedValueOnce({ data: () => mockConvocatoria });
        (enviarABlockchain as jest.Mock).mockResolvedValueOnce({ success: false });

        const response = await request(app)
            .post(`/api/convocatoria/blockchain/${mockId}`) // Cambia a POST
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Error al subir la convocatoria a la blockchain');
    });
});
