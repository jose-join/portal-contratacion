import request from 'supertest';
import app from '../../backend/server';  // Asegúrate de que esta ruta sea correcta
import { createDoc, queryDocsByField, updateDocById, queryDocsByFields, getDocById } from '../../backend/services/firebaseService';
import { subirDocumento } from '../../backend/services/documentUploadService';

// Mock de Firebase y otros servicios
jest.mock('../../backend/services/firebaseService', () => ({
    createDoc: jest.fn(),
    queryDocsByField: jest.fn(),
    updateDocById: jest.fn(),
    queryDocsByFields: jest.fn(),
    getDocById: jest.fn(),
}));

jest.mock('../../backend/services/documentUploadService', () => ({
    subirDocumento: jest.fn(),
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

// Pruebas de integración
describe('Pruebas de integración - Postulante Controller', () => {

    // Prueba de postulación a una convocatoria
    it('Debería postularse a una convocatoria', async () => {
        const convocatoriaId = 'testConvocatoriaId';

        // Mock para verificar que no existe una postulación previa
        (queryDocsByFields as jest.Mock).mockResolvedValueOnce({ empty: true });

        // Mock de la convocatoria
        (getDocById as jest.Mock).mockResolvedValueOnce({
            exists: true,
            data: () => ({
                titulo: 'Convocatoria de Prueba',
                documentosRequeridos: {
                    cv: true,
                    dni: true,
                    certificadosEstudios: true,
                    certificadosTrabajo: true,
                    declaracionJurada: true,
                },
            }),
        });

        // Mock de los documentos subidos del postulante
        const documentosSubidos = {
            cvUrl: 'mockCvUrl',
            dniUrl: 'mockDniUrl',
            certificadosEstudiosUrl: 'mockCertificadosEstudiosUrl',
            certificadosTrabajoUrl: 'mockCertificadosTrabajoUrl',
            declaracionJuradaUrl: 'mockDeclaracionJuradaUrl',
        };
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            docs: [{ data: () => documentosSubidos }],
        });

        // Mock para crear la postulación
        (createDoc as jest.Mock).mockResolvedValueOnce({});

        const response = await request(app)
            .post(`/api/postulante/postular/${convocatoriaId}`)
            .set('Authorization', `Bearer mockToken`)
            .send();

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Postulación realizada con éxito');
        expect(createDoc).toHaveBeenCalledWith('postulaciones', expect.any(Object));
    });

    // Prueba de error cuando faltan documentos
    it('Debería devolver un error si faltan documentos para postularse', async () => {
        const convocatoriaId = 'testConvocatoriaId';

        // Mock para verificar que no existe una postulación previa
        (queryDocsByFields as jest.Mock).mockResolvedValueOnce({ empty: true });

        // Mock de documentos subidos, faltando algunos
        const documentosIncompletos = {
            dniUrl: 'mockDniUrl',
        };
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            docs: [{ data: () => documentosIncompletos }],
        });

        const response = await request(app)
            .post(`/api/postulante/postular/${convocatoriaId}`)
            .set('Authorization', `Bearer mockToken`)
            .send();

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Faltan los siguientes documentos');
    });

    // Prueba de subir documentos
    it('Debería subir documentos del postulante correctamente', async () => {
        const postulanteId = 'testPostulanteId';

        // Mock para la subida de documentos
        (subirDocumento as jest.Mock).mockResolvedValue('mockUrl');

        // Mock de documentos existentes
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            empty: false,
            docs: [{ id: 'docId', data: () => ({}) }],
        });

        const response = await request(app)
            .post('/api/postulante/subir-documentos')
            .set('Authorization', `Bearer mockToken`)
            .attach('dni', Buffer.from('dni content'), 'dni.pdf');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Documentos actualizados con éxito.');
        expect(updateDocById).toHaveBeenCalledWith('documentosPostulantes', 'docId', expect.any(Object));
    });

    // Prueba para ver las postulaciones
    it('Debería devolver las postulaciones del postulante correctamente', async () => {
        const postulanteId = 'testPostulanteId';

        // Mock para obtener las postulaciones filtradas por el postulanteId
        const postulacionData = {
            idConvocatoria: 'testConvocatoriaId',
            nombreConvocatoria: 'Convocatoria de Prueba',
            estado: 'en proceso',
        };

        // Simular la consulta usando postulanteId
        (queryDocsByField as jest.Mock).mockResolvedValueOnce({
            docs: [{ id: 'testPostulacionId', data: () => postulacionData }],
        });

        const response = await request(app)
            .get('/api/postulante/ver-postulaciones')
            .set('Authorization', `Bearer mockToken`)  // Simula un token de autorización
            .send();

        expect(response.status).toBe(200);
        expect(queryDocsByField).toHaveBeenCalledWith('postulaciones', 'idPostulante', postulanteId);
        expect(response.body).toHaveProperty('postulaciones');
        expect(response.body.postulaciones).toHaveLength(1);
        expect(response.body.postulaciones[0]).toHaveProperty('nombreConvocatoria', 'Convocatoria de Prueba');
    });



});
