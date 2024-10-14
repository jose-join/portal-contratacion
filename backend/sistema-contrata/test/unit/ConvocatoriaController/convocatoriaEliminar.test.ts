import request from 'supertest';
import app from '../../../backend/server';
import { getDocById, deleteDocById } from '../../../backend/services/firebaseService'; // Mock de Firebase
import { enviarABlockchain } from '../../../backend/services/blockchainService'; // Mock de Blockchain

// Mock de Firebase y Blockchain
jest.mock('../../../backend/services/firebaseService', () => ({
    getDocById: jest.fn(),
    updateDocById: jest.fn(),
    deleteDocById: jest.fn(),
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

describe('DELETE /api/convocatoria/:id', () => {
  it('Debería eliminar una convocatoria tanto de Firebase como de la blockchain', async () => {
    const mockId = 'convocatoria123';
    const mockConvocatoria = { subidoBlockchain: true };

    (getDocById as jest.Mock).mockResolvedValueOnce({ data: () => mockConvocatoria });
    (enviarABlockchain as jest.Mock).mockResolvedValueOnce({ success: true });

    const response = await request(app)
      .delete(`/api/convocatoria/${mockId}`)
      .set('Authorization', 'Bearer adminToken');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Convocatoria eliminada con éxito, tanto de Firebase como de la blockchain (si estaba subida).');
    expect(deleteDocById).toHaveBeenCalledWith('convocatorias', mockId);
  });

  it('Debería devolver un error si la convocatoria no existe', async () => {
    const mockId = 'convocatoriaInexistente';

    (getDocById as jest.Mock).mockResolvedValueOnce({ data: () => null });

    const response = await request(app)
      .delete(`/api/convocatoria/${mockId}`)
      .set('Authorization', 'Bearer adminToken');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Convocatoria no encontrada.');
  });
});
