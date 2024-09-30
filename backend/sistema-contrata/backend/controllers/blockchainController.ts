import Web3 from 'web3';
import { abi, contractAddress } from '../utils/contractConfig';  // ABI y dirección del contrato
import { Request, Response } from 'express';

// Inicializar Web3 con el proveedor Alchemy o Infura
const alchemyApiUrl = process.env.ALCHEMY_API_URL || '';
const web3 = new Web3(alchemyApiUrl);

// Crear una instancia del contrato inteligente
const contratoConvocatoria = new web3.eth.Contract(abi as any, contractAddress);

// Función para convertir BigInt a string de manera segura
const convertirBigInt = (obj: any) => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

// Función para obtener todas las transacciones relacionadas con las convocatorias
export const obtenerTodasLasTransacciones = async (req: Request, res: Response) => {
  try {
    // Obtener todos los eventos de creación de convocatorias usando el nombre correcto del evento
    const eventosConvocatorias: any[] = await contratoConvocatoria.getPastEvents('ConvocatoriaCreada', {
      fromBlock: 0,  // Desde el bloque génesis o un bloque específico
      toBlock: 'latest'  // Hasta el último bloque minado
    });

    // Obtener todos los eventos de adición de postulantes usando el nombre correcto del evento
    const eventosPostulantes: any[] = await contratoConvocatoria.getPastEvents('PostulantesAgregados', {
      fromBlock: 0,
      toBlock: 'latest'
    });

    // Combinar todos los eventos en una sola lista
    const todosLosEventos = [...eventosConvocatorias, ...eventosPostulantes];

    // Procesar y formatear los eventos para devolverlos en la respuesta
    const eventosFormateados = todosLosEventos.map(event => ({
      tipo: event.event,  // Tipo de evento
      returnValues: convertirBigInt(event.returnValues),  // Convertimos BigInt a string si es necesario
      transactionHash: event.transactionHash  // Hash de la transacción
    }));

    // Devolver la lista de eventos formateados
    res.status(200).json({
      message: 'Transacciones obtenidas con éxito',
      eventos: eventosFormateados
    });
  } catch (error) {
    console.error('Error al obtener las transacciones de la blockchain:', error);
    res.status(500).json({ error: 'Error al obtener las transacciones de la blockchain', details: error });
  }
};
