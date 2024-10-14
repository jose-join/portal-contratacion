import request from 'supertest';
import app from '../../../backend/server';
import { getDocById, updateDocById } from '../../../backend/services/firebaseService'; // Mock de Firebase

jest.mock('../../../backend/services/firebaseService', () => ({
    getDocById: jest.fn(),
    updateDocById: jest.fn(),
}));

jest.mock('../../../backend/middlewares/authorizeRole', () => ({
    authorizeRole: () => (req: Request, res: Response, next: Function) => {
        (req as any).user = { role: 'admin' }; // Simula autenticación como administrador
        next();
    }
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

describe('PUT /api/convocatoria/:id', () => {
    it('Debería actualizar una convocatoria correctamente si no ha sido subida a la blockchain', async () => {
        const mockId = 'convocatoria123';
        const updatedData = { titulo: 'Convocatoria Actualizada', descripcion: 'Descripción actualizada' };
        const mockConvocatoria = { subidoBlockchain: false };

        (getDocById as jest.Mock).mockResolvedValueOnce({ data: () => mockConvocatoria });
        (updateDocById as jest.Mock).mockResolvedValueOnce({});

        const response = await request(app)
            .put(`/api/convocatoria/${mockId}`)
            .send(updatedData)
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Convocatoria actualizada con éxito');
        expect(updateDocById).toHaveBeenCalledWith('convocatorias', mockId, updatedData);
    });

    it('Debería devolver un error 404 si la convocatoria no existe', async () => {
        const mockId = 'convocatoriaInexistente';
        const updatedData = { titulo: 'Convocatoria Actualizada', descripcion: 'Descripción actualizada' };

        (getDocById as jest.Mock).mockResolvedValueOnce({ data: () => null });

        const response = await request(app)
            .put(`/api/convocatoria/${mockId}`)
            .send(updatedData)
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Convocatoria no encontrada.');
    });

    it('Debería devolver un error 400 si la convocatoria ya ha sido subida a la blockchain', async () => {
        const mockId = 'convocatoria123';
        const updatedData = { titulo: 'Convocatoria Actualizada', descripcion: 'Descripción actualizada' };
        const mockConvocatoria = { subidoBlockchain: true };

        (getDocById as jest.Mock).mockResolvedValueOnce({ data: () => mockConvocatoria });

        const response = await request(app)
            .put(`/api/convocatoria/${mockId}`)
            .send(updatedData)
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'No se puede actualizar. La convocatoria ya está en la blockchain.');
        expect(updateDocById).not.toHaveBeenCalled(); // Verifica que `updateDocById` no haya sido llamado
    });

    it('Debería devolver un error 500 si ocurre un problema al actualizar la convocatoria', async () => {
        const mockId = 'convocatoria123';
        const updatedData = { titulo: 'Convocatoria Actualizada', descripcion: 'Descripción actualizada' };
        const mockConvocatoria = { subidoBlockchain: false };

        (getDocById as jest.Mock).mockResolvedValueOnce({ data: () => mockConvocatoria });
        (updateDocById as jest.Mock).mockRejectedValueOnce(new Error('Error al actualizar'));
        (updateDocById as jest.Mock).mockImplementation(() => {
            console.log('updateDocById ha sido llamado');
            return Promise.resolve();
        });

        const response = await request(app)
            .put(`/api/convocatoria/${mockId}`)
            .send(updatedData)
            .set('Authorization', 'Bearer adminToken');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error al actualizar la convocatoria');
        expect(response.body).toHaveProperty('details', 'Error al actualizar');
    });
});
