import request from 'supertest';
import app from '../../../backend/server';
import { getDocById, updateDocById, queryDocsByField } from '../../../backend/services/firebaseService';
import { enviarABlockchain } from '../../../backend/services/blockchainService'; 

jest.mock('../../../backend/services/firebaseService', () => ({
  getDocById: jest.fn(),
  updateDocById: jest.fn(),
  queryDocsByField: jest.fn(),
}));

jest.mock('../../../backend/services/blockchainService', () => ({
  enviarABlockchain: jest.fn(),
  escucharEventos: jest.fn(),
}));

jest.mock('../../../backend/middlewares/authorizeRole', () => ({
    authorizeRole: () => (req: Request, res: Response, next: Function) => {
      (req as any).user = { role: 'admin' };
      next();
    },
  }));
describe('POST /api/convocatoria/blockchain/conPostulantes/:idConvocatoria', () => {
  const mockIdConvocatoria = 'convocatoria123';
  const mockConvocatoria = {
    validado: true,
    fechasImportantes: {
      inicioConvocatoria: '2024-10-01',
      cierreConvocatoria: '2024-10-15',
      fechaEvaluacion: '2024-10-20',
      publicacionResultados: '2024-11-01',
    },
  };
  const mockPostulaciones = {
    docs: [
      { id: 'postulacion1', data: () => ({ idPostulante: 'postulante1' }) },
      { id: 'postulacion2', data: () => ({ idPostulante: 'postulante2' }) },
    ],
  };

  it('Debería subir la convocatoria y los postulantes a la blockchain y actualizar el estado', async () => {
    (getDocById as jest.Mock).mockResolvedValueOnce({ data: () => mockConvocatoria });
    (queryDocsByField as jest.Mock).mockResolvedValueOnce(mockPostulaciones);
    (enviarABlockchain as jest.Mock).mockResolvedValueOnce({ success: true });

    const response = await request(app)
      .post(`/api/convocatoria/blockchain-postulantes/${mockIdConvocatoria}`)
      .set('Authorization', 'Bearer adminToken');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Convocatoria y postulantes subidos a la blockchain con éxito, estado actualizado a evaluación.');
    expect(updateDocById).toHaveBeenCalledWith('convocatorias', mockIdConvocatoria, { subidoBlockchain: true, estado: 'evaluacion' });
  });

  it('Debería devolver un error 404 si no hay postulantes para la convocatoria', async () => {
    (getDocById as jest.Mock).mockResolvedValueOnce({ data: () => mockConvocatoria });
    (queryDocsByField as jest.Mock).mockResolvedValueOnce({ docs: [] }); // Sin postulantes

    const response = await request(app)
      .post(`/api/convocatoria/blockchain-postulantes/${mockIdConvocatoria}`)
      .set('Authorization', 'Bearer adminToken');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'No hay postulantes para esta convocatoria');
  });
});
