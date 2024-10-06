import { Router } from 'express';
import { subirDocumentosPostulante, postularseConvocatoria, verPostulaciones, verificarPostulacion, obtenerDocumentosPostulante } from '../controllers/postulanteController';
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
  authorizeRole(['postulante']),  // Asegurar que solo los postulantes pueden acceder a esta ruta
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'dni', maxCount: 1 },
    { name: 'certificadosEstudios', maxCount: 1 },
    { name: 'certificadosTrabajo', maxCount: 1 },
    { name: 'declaracionJurada', maxCount: 1 }
  ]),  // Permitimos subir uno o varios documentos a la vez
  subirDocumentosPostulante  // Controlador para manejar la subida de documentos
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
// Nueva ruta para verificar si el postulante ya se ha postulado a una convocatoria específica
router.get(
  '/ver-postulacion/:idConvocatoria',  // Singular para verificar una postulación específica
  authMiddleware,
  authorizeRole(['postulante']),
  verificarPostulacion  // Controlador que tendrás que crear para manejar la verificación
);
router.get(
  '/obtener-documentos',
  authMiddleware,
  authorizeRole(['postulante']),
  obtenerDocumentosPostulante  // Controlador para obtener los documentos subidos
);



export default router;
