import { Router } from 'express';
import { obtenerTodasLasTransacciones } from '../controllers/blockchainController';  // Controlador de transacciones
import { authMiddleware } from '../middlewares/authMiddleware';  // Middleware de autenticación
import { authorizeRole } from '../middlewares/authorizeRole';  // Middleware de autorización

const router = Router();

// Ruta protegida para obtener todas las transacciones
router.get(
  '/transacciones',
  authMiddleware,  // Verifica si el usuario está autenticado
  authorizeRole(['admin', 'postulante']),  // Verifica si el usuario tiene el rol adecuado
  obtenerTodasLasTransacciones  // Controlador de transacciones
);

export default router;
