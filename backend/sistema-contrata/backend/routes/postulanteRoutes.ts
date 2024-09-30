import { Router } from 'express';
import { subirDocumentosPostulante, postularseConvocatoria, verPostulaciones } from '../controllers/postulanteController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRole } from '../middlewares/authorizeRole';
import multer from 'multer';

// Configuración de multer para almacenar los archivos en la memoria temporalmente
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// Ruta para subir documentos del postulante
router.post(
  '/subir-documentos',
  authMiddleware,
  authorizeRole(['postulante']),
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'dni', maxCount: 1 }
  ]),
  subirDocumentosPostulante  // Controlador para manejar la subida
);

// Ruta para postularse a una convocatoria
router.post(
  '/postular/:idConvocatoria',
  authMiddleware,
  authorizeRole(['postulante']),
  postularseConvocatoria  // Controlador para manejar la postulación
);

// Ruta para ver las postulaciones del postulante
router.get(
  '/ver-postulaciones',
  authMiddleware,
  authorizeRole(['postulante']),
  verPostulaciones  // Controlador para ver las postulaciones
);

export default router;
