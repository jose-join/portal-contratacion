import { Router } from 'express';
import { 
    createConvocatoria, 
    mostrarConvocatoria, 
    actualizarConvocatoria, 
    eliminarConvocatoria, 
    validarConvocatoria, 
    mostrarTodasConvocatorias, 
    subirConvocatoriaBlockchain, 
    contarPostulantesConvocatoria, 
    subirConvocatoriaConPostulantes 
} from '../controllers/convocatoriaController';  // Importamos las funciones del controlador
import { authorizeRole } from '../middlewares/authorizeRole';  // Importamos el middleware de autorización

const router = Router();

// **Rutas protegidas para administradores**
// Ruta para crear una nueva convocatoria (solo admins)
router.post('/', authorizeRole(['admin']), createConvocatoria);

// Ruta para actualizar una convocatoria existente (solo admins)
router.put('/:id', authorizeRole(['admin']), actualizarConvocatoria);

// Ruta para eliminar una convocatoria (solo admins)
router.delete('/:id', authorizeRole(['admin']), eliminarConvocatoria);

// Ruta para validar una convocatoria antes de subirla a la blockchain (solo admins)
router.put('/validar/:id', authorizeRole(['admin']), validarConvocatoria);

// Ruta para subir una convocatoria a la blockchain (solo admins)
router.post('/blockchain/:id', authorizeRole(['admin']), subirConvocatoriaBlockchain);

// **Rutas para visualizar convocatorias (accesible tanto para administradores como para postulantes)**
// Ruta para mostrar una convocatoria específica por su ID
router.get('/:id', authorizeRole(['postulante', 'admin']), mostrarConvocatoria);

// Ruta para obtener todas las convocatorias (disponible para postulantes y administradores)
router.get('/', authorizeRole(['postulante', 'admin']), mostrarTodasConvocatorias);

// **Rutas adicionales**
// Ruta para contar el número de postulantes en una convocatoria específica (solo admins)
router.get('/postulantes/:idConvocatoria', authorizeRole(['admin']), contarPostulantesConvocatoria);

// Ruta para subir la convocatoria junto con los postulantes a la blockchain (solo admins)
router.post('/blockchain-postulantes/:idConvocatoria', authorizeRole(['admin']), subirConvocatoriaConPostulantes);

export default router;
