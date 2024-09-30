import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// **Exportar CustomRequest**
export interface CustomRequest extends Request {
  user?: {
    userId: string;  // Cambiar a userId, ya que es como se genera en el token
    role: 'admin' | 'postulante';  // Definir los roles permitidos
    [key: string]: any;  // Permitir otras propiedades si es necesario
  };
}

// Middleware de autenticación
export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.header('x-auth-token');  // Leer el token del header

  // Verificar si el token está presente
  if (!token) {
    return res.status(401).json({ message: 'No hay token, permiso denegado' });
  }

  try {
    // Verificar el token y decodificarlo
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecreto') as CustomRequest['user'];

    // Asegurarse de que el token tenga userId y role
    if (decoded && decoded.userId && decoded.role) {
      req.user = { userId: decoded.userId, role: decoded.role };  // Asignar la información del token a req.user
      next();  // Pasar al siguiente middleware
    } else {
      return res.status(401).json({ message: 'Token inválido, faltan propiedades' });
    }
  } catch (err) {
    // Diferenciar entre un token expirado o un token inválido
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado, por favor inicie sesión nuevamente' });
    } else if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token no válido' });
    } else {
      return res.status(500).json({ message: 'Error en la verificación del token', error: (err as Error).message });
    }
  }
};
