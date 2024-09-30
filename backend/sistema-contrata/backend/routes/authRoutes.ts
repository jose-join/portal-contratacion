import { Router, Request, Response } from 'express';
import { check } from 'express-validator';
import { registerPostulante, login } from '../controllers/authController';  // Importar el registro de postulantes y login
import { authMiddleware } from '../middlewares/authMiddleware';  // Middleware de autenticación

const router = Router();

// Ruta para registrar un nuevo postulante
router.post(
  '/registerPostulante',
  [
    check('email', 'Por favor, ingresa un email válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    check('usuario', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('nombres', 'Los nombres son obligatorios').not().isEmpty(),
    check('apellidos', 'Los apellidos son obligatorios').not().isEmpty(),
    check('dni', 'El DNI es obligatorio y debe ser un número válido').isNumeric(),
    check('edad', 'La edad es obligatoria y debe ser un número').isInt(),
    check('telefono', 'El número de teléfono es obligatorio').not().isEmpty(),
  ],
  registerPostulante  // Usar la función para registrar postulantes
);

// Ruta para hacer login (tanto para postulantes como para administrador)
router.post(
  '/login',
  [
    check('email', 'Por favor, ingresa un email válido').isEmail(),
    check('password', 'La contraseña es requerida').not().isEmpty()
  ],
  login
);

// Ruta protegida que requiere autenticación (solo usuarios autenticados pueden acceder)
router.get('/protected', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;  // Usamos Type Assertion para acceder a 'user'

  res.status(200).json({
    message: 'Ruta protegida accesible',
    user: user  // Retorna los datos del usuario autenticado
  });
});

export default router;
