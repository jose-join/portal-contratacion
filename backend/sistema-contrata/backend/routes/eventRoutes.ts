import { Router } from 'express';
import { obtenerEventos } from '../controllers/eventoController';

const router = Router();

// Ruta para obtener eventos desde la blockchain guardados en Firebase
router.get('/eventos', obtenerEventos);

export default router;
