import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Función para generar un token JWT
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET as string, { expiresIn: '1h' }); // Token válido por 1 hora
};

// Función para verificar un token JWT
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET as string);
  } catch (error) {
    throw new Error('Token inválido');
  }
};
