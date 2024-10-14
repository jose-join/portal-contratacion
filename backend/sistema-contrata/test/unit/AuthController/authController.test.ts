import request from 'supertest';
import app from '../../../backend/server'; // Asegúrate de que esta ruta sea correcta
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../backend/utils/firebaseConfig'; // Asegúrate de que esta ruta sea correcta

// Mock de Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),  // Mock para login
}));

jest.mock('../../../backend/services/blockchainService', () => ({
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

describe('POST /api/auth/registerPostulante', () => {
  it('Debería registrar un postulante correctamente', async () => {
    // Datos de prueba para el registro
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      usuario: 'testuser',
      nombres: 'Test',
      apellidos: 'User',
      dni: '12345678',
      edad: 25,
      telefono: '123456789',
    };

    // Mock para la creación de un usuario en Firebase Authentication
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { uid: 'mockUserId' },
    });

    // Mock para guardar los datos del postulante en Firestore
    (setDoc as jest.Mock).mockResolvedValueOnce({});

    // Ejecutar la petición POST para el registro
    const response = await request(app)
      .post('/api/auth/registerPostulante')  // Cambié la ruta para reflejar tu código
      .send(registerData);

    // Verificaciones
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Postulante registrado correctamente');
    expect(response.body).toHaveProperty('userId', 'mockUserId');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, registerData.email, registerData.password);
    expect(setDoc).toHaveBeenCalledWith(
      doc(db, 'users', 'mockUserId'),
      expect.objectContaining({
        email: registerData.email,
        usuario: registerData.usuario,
        nombres: registerData.nombres,
        apellidos: registerData.apellidos,
        dni: registerData.dni,
        edad: registerData.edad,
        telefono: registerData.telefono,
        role: 'postulante',
      })
    );
  });

  it('Debería devolver un error si hay un fallo en el registro', async () => {
    // Mock de error en Firebase Authentication
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error('Error en Firebase'));

    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      usuario: 'testuser',
      nombres: 'Test',
      apellidos: 'User',
      dni: '12345678',
      edad: 25,
      telefono: '123456789',
    };

    // Ejecutar la petición POST con error simulado
    const response = await request(app)
      .post('/api/auth/registerPostulante')
      .send(registerData);

    // Verificaciones
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Error en el registro');
    expect(response.body).toHaveProperty('error', 'Error en Firebase');
  });
});

describe('POST /api/auth/login', () => {
  it('Debería iniciar sesión correctamente y devolver un token JWT', async () => {
    // Datos de prueba para el login
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Mock para el login en Firebase Authentication
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { uid: 'mockUserId' },
    });

    // Mock para obtener los datos del usuario desde Firestore
    (getDoc as jest.Mock).mockResolvedValueOnce({
      data: () => ({ role: 'postulante' }),
    });

    // Ejecutar la petición POST para el login
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    // Verificaciones
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login exitoso');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('role', 'postulante');
    expect(response.body).toHaveProperty('userId', 'mockUserId');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, loginData.email, loginData.password);
    expect(getDoc).toHaveBeenCalledWith(doc(db, 'users', 'mockUserId'));
  });

  it('Debería devolver un error si las credenciales son incorrectas', async () => {
    // Mock de error en Firebase Authentication
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error('Credenciales inválidas'));

    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    // Ejecutar la petición POST con error simulado
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    // Verificaciones
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Error en el login');
    expect(response.body).toHaveProperty('error', 'Credenciales inválidas');
  });
});
