import request from 'supertest';
import app from '../../backend/server';  // Ajusta la ruta según tu estructura de carpetas
import { createDoc, getDocById, updateDocById, deleteDocById, queryDocsByField } from '../../backend/services/firebaseService';
import { enviarABlockchain } from '../../backend/services/blockchainService';

// Mock de los servicios de Firebase
jest.mock('../../backend/services/firebaseService', () => ({
    createDoc: jest.fn(),
    getDocById: jest.fn(),
    updateDocById: jest.fn(),
    deleteDocById: jest.fn(),
    queryDocsByField: jest.fn(),
}));

// Mock del servicio de blockchain
jest.mock('../../backend/services/blockchainService', () => ({
    enviarABlockchain: jest.fn(),
    escucharEventos: jest.fn()
}));

jest.mock('../../backend/middlewares/authorizeRole', () => ({
    authorizeRole: (roles: string[]) => (req: any, res: any, next: Function) => {
      req.user = { userId: 'testUserId', role: roles[0] };  // Simula un usuario autorizado
      next();  // Permite que pase la autorización
    },
  }));

  jest.mock('../../backend/middlewares/authMiddleware', () => ({
    authMiddleware: (req: any, res: any, next: Function) => {
      req.user = { userId: 'testUserId' };  // Simula un usuario autenticado
      next();
    },
  }));

describe('Pruebas de integración - Convocatoria Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();  // Limpiar los mocks entre cada prueba
    });

    // Prueba para crear una convocatoria
    it('Debería crear una convocatoria en Firebase', async () => {
        const convocatoriaData = {
            titulo: 'Convocatoria de Prueba',
            descripcion: 'Descripción de prueba',
            fechasImportantes: {
                inicioConvocatoria: '2024-10-06',
                cierreConvocatoria: '2024-10-20',
                fechaEvaluacion: '2024-10-25',
                publicacionResultados: '2024-10-30',
            },
            validado: false,
            subidoBlockchain: false,
        };

        // Simular la creación de un documento en Firebase
        (createDoc as jest.Mock).mockResolvedValueOnce('mockConvocatoriaId');

        const response = await request(app)
            .post('/api/convocatoria')  // Ajusta la ruta según tu servidor
            .send(convocatoriaData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Convocatoria creada en Firebase con éxito');
        expect(response.body).toHaveProperty('id', 'mockConvocatoriaId');
        expect(createDoc).toHaveBeenCalledWith('convocatorias', expect.objectContaining(convocatoriaData));
    });

    // Prueba para validar una convocatoria
    it('Debería validar una convocatoria existente', async () => {
        const convocatoriaId = 'mockConvocatoriaId';
        const convocatoriaData = {
            titulo: 'Convocatoria de Prueba',
            subidoBlockchain: false,
        };

        // Simular la obtención de un documento en Firebase
        (getDocById as jest.Mock).mockResolvedValueOnce({
            data: () => convocatoriaData,
        });

        const response = await request(app)
            .put(`/api/convocatoria/validar/${convocatoriaId}`)  // Ruta para validar convocatoria
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Convocatoria validada con éxito');
        expect(updateDocById).toHaveBeenCalledWith('convocatorias', convocatoriaId, { validado: true });
    });

    // Prueba para actualizar una convocatoria
    it('Debería actualizar una convocatoria si no ha sido subida a la blockchain', async () => {
        const convocatoriaId = 'mockConvocatoriaId';
        const convocatoriaData = {
            titulo: 'Convocatoria de Prueba',
            subidoBlockchain: false,
        };
        const updatedData = {
            titulo: 'Convocatoria Actualizada',
            descripcion: 'Descripción actualizada',
        };

        // Simular la obtención de un documento en Firebase
        (getDocById as jest.Mock).mockResolvedValueOnce({
            data: () => convocatoriaData,
        });

        const response = await request(app)
            .put(`/api/convocatoria/${convocatoriaId}`)  // Ruta para actualizar convocatoria
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Convocatoria actualizada con éxito');
        expect(updateDocById).toHaveBeenCalledWith('convocatorias', convocatoriaId, expect.objectContaining(updatedData));
    });

    // Prueba para eliminar una convocatoria
    it('Debería eliminar una convocatoria de Firebase y de la blockchain', async () => {
        const convocatoriaId = 'mockConvocatoriaId';
        const convocatoriaData = {
            titulo: 'Convocatoria de Prueba',
            subidoBlockchain: true,
        };

        // Simular la obtención de un documento en Firebase
        (getDocById as jest.Mock).mockResolvedValueOnce({
            data: () => convocatoriaData,
        });

        // Simular la eliminación en la blockchain
        (enviarABlockchain as jest.Mock).mockResolvedValueOnce({ success: true });

        const response = await request(app)
            .delete(`/api/convocatoria/${convocatoriaId}`)  // Ruta para eliminar convocatoria
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Convocatoria eliminada con éxito, tanto de Firebase como de la blockchain (si estaba subida).');
        expect(deleteDocById).toHaveBeenCalledWith('convocatorias', convocatoriaId);
        expect(enviarABlockchain).toHaveBeenCalledWith({
            id: convocatoriaId,
            inicioConvocatoria: 0,
            cierreConvocatoria: 0,
            fechaEvaluacion: 0,
            publicacionResultados: 0,
        });
    });
});
