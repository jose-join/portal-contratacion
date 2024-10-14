import request from 'supertest';
// Removed jest import as it is globally available
import app from '../../backend/server';  // Importa tu servidor Express
import { auth, db } from '../../backend/utils/firebaseConfig';  // Firebase configuración para emular
import { doc, getDoc } from 'firebase/firestore';  // Firestore métodos para verificar resultados
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';  // Firebase Auth métodos

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
}));
jest.mock('../../backend/services/blockchainService', () => ({
    escucharEventos: jest.fn(),  // Mock de función que escucha los eventos
    detenerWebSocket: jest.fn(), // Asegúrate de detener el WebSocket si es necesario
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    doc: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn(() => ({
        empty: false,  // Simulando que la colección no está vacía
        docs: [
            { id: 'mockId1', data: () => ({ field1: 'value1' }) },
            { id: 'mockId2', data: () => ({ field1: 'value2' }) },
        ],
    })),
    setDoc: jest.fn(),
    getDoc: jest.fn(),  // Mock para obtener datos de Firestore
}));

let webSocketConnection: WebSocket | undefined;

afterAll(() => {
    // Aquí asegúrate de cerrar cualquier conexión WebSocket
    if (typeof webSocketConnection !== 'undefined') {
        webSocketConnection.close();
    }
});

describe('Pruebas de integración - Postulante Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks();  // Limpiar mocks entre cada prueba
    });

    it('Debería registrar un nuevo postulante y almacenar su información en Firestore', async () => {
        // Simular la creación de usuario en Firebase Authentication
        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
            user: { uid: 'testPostulanteId' },
        });

        // Simular la respuesta exitosa al almacenar en Firestore
        const response = await request(app)
            .post('/api/auth/registerPostulante')  // Asegúrate de que la ruta coincide con tu servidor
            .send({
                email: 'test@test.com',
                password: 'password123',
                usuario: 'testPostulante',
                nombres: 'Test',
                apellidos: 'Postulante',
                dni: '12345678',
                edad: 25,
                telefono: '123456789',
            });

        expect(response.status).toBe(201);  // Aseguramos que el estado sea 201 (creado)
        expect(response.body).toHaveProperty('message', 'Postulante registrado correctamente');
        expect(response.body).toHaveProperty('userId', 'testPostulanteId');

        // Verificar que se llamó al método de creación de usuario en Firebase Auth
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@test.com', 'password123');
    });

    it('Debería devolver un error si el registro de postulante falla', async () => {
        // Simular error en Firebase Authentication
        (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error('Firebase Auth Error'));

        const response = await request(app)
            .post('/api/auth/registerPostulante')
            .send({
                email: 'test@test.com',
                password: 'password123',
                usuario: 'testPostulante',
                nombres: 'Test',
                apellidos: 'Postulante',
                dni: '12345678',
                edad: 25,
                telefono: '123456789',
            });

        expect(response.status).toBe(500);  // Aseguramos que se devuelva un error 500
        expect(response.body).toHaveProperty('message', 'Error en el registro');
        expect(response.body).toHaveProperty('error', 'Firebase Auth Error');
    });

    it('Debería permitir que un postulante inicie sesión correctamente', async () => {
        // Simular la autenticación con Firebase Authentication
        (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
            user: { uid: 'testPostulanteId' },
        });

        // Simular la consulta exitosa a Firestore para obtener el rol
        (getDoc as jest.Mock).mockResolvedValueOnce({
            exists: true,
            data: () => ({ role: 'postulante' }),
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: 'password123',
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login exitoso');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('role', 'postulante');
        expect(response.body).toHaveProperty('userId', 'testPostulanteId');
    });

    it('Debería devolver un error si el login falla', async () => {
        // Simular error en Firebase Authentication
        (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error('Firebase Auth Error'));

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: 'password123',
            });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Error en el login');
        expect(response.body).toHaveProperty('error', 'Firebase Auth Error');
    });

});
