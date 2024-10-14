import express from 'express';
import cors from 'cors';  // Importa cors
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import convocatoriaRoutes from './routes/convocatoriaRoutes';
import postulanteRoutes from './routes/postulanteRoutes'; 
import blockchainRoutes from './routes/blockchainRoutes';
import { escucharEventos } from './services/blockchainService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: 'http://localhost:5173'  // Permitir solicitudes desde localhost:5173 (tu frontend)
}));

// Middleware para parsear JSON
app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de convocatoria
app.use('/api/convocatoria', convocatoriaRoutes);

// Rutas de postulante
app.use('/api/postulante', postulanteRoutes);

app.use('/api/blockchain', blockchainRoutes);

escucharEventos();

// Iniciar el servidor solo si no es un entorno de prueba
if (process.env.NODE_ENV !== 'test') {
  escucharEventos();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

// Exporta la instancia de app para usarla en las pruebas
export default app;
