import Web3 from 'web3';
import { abi, contractAddress } from '../utils/contractConfig';  // Archivo con la dirección del contrato y su ABI
import { db } from '../utils/firebaseConfig';  // Firebase para guardar logs de eventos
import { collection, addDoc } from 'firebase/firestore';

// Configuración del proveedor y la wallet (HTTP y WebSocket)
const alchemyHttpUrl = process.env.ALCHEMY_API_URL || '';
const alchemyWsUrl = process.env.ALCHEMY_WS_URL || '';
if (!alchemyHttpUrl || !alchemyWsUrl) {
  throw new Error('ALCHEMY_API_URL o ALCHEMY_WS_URL no están definidas');
}

const privateKey = process.env.PRIVATE_KEY || '';
if (!privateKey) {
  throw new Error('PRIVATE_KEY no está definido');
}

// Inicialización de Web3 con el proveedor HTTP de Alchemy para transacciones
const web3Http = new Web3(alchemyHttpUrl);

// Inicialización de Web3 con el proveedor WebSocket de Alchemy para eventos
const web3Ws = new Web3(new Web3.providers.WebsocketProvider(alchemyWsUrl));

// Verificar si la conexión WebSocket está activa
web3Ws.eth.net.isListening()
  .then(() => console.log('WebSocket conectado correctamente'))
  .catch((err) => {
    console.error('Error conectando al WebSocket:', err);
    return; // Detenemos la ejecución si no hay conexión WebSocket.
  });

// Cargar la cuenta desde la clave privada
const account = web3Http.eth.accounts.privateKeyToAccount(`0x${privateKey}`);
web3Http.eth.accounts.wallet.add(account);  // Añadir la cuenta al wallet

// ======= Función para firmar y enviar transacciones a la blockchain =======
export const enviarABlockchain = async (convocatoriaData: { id: string, inicioConvocatoria: number, cierreConvocatoria: number, fechaEvaluacion: number, publicacionResultados: number, postulantes?: string[] }) => {
  try {
    const contrato = new web3Http.eth.Contract(abi, contractAddress);

    let tx;
    if (!convocatoriaData.postulantes) {
      console.log(`Creando convocatoria en blockchain: ${convocatoriaData.id}`);
      tx = contrato.methods.crearConvocatoria(
        convocatoriaData.id,
        convocatoriaData.inicioConvocatoria,
        convocatoriaData.cierreConvocatoria,
        convocatoriaData.fechaEvaluacion,
        convocatoriaData.publicacionResultados
      );
    } else {
      console.log(`Subiendo convocatoria con postulantes: ${convocatoriaData.id}`);
      tx = contrato.methods.agregarPostulantes(
        convocatoriaData.id,
        convocatoriaData.postulantes
      );
    }

    const gas = await tx.estimateGas({ from: account.address });
    const gasPrice = await web3Http.eth.getGasPrice();

    const txObject = {
      from: account.address,
      to: contractAddress,
      gas,
      gasPrice,
      data: tx.encodeABI(),
    };

    const signedTx = await web3Http.eth.accounts.signTransaction(txObject, privateKey);
    const receipt = await web3Http.eth.sendSignedTransaction(signedTx.rawTransaction || '');
    console.log('Transacción enviada con éxito:', receipt.transactionHash);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error('Error al interactuar con la blockchain:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ======= Función para escuchar todos los eventos en la blockchain y guardarlos en Firebase =======
export const escucharEventos = () => {
  console.log('Iniciando listener de eventos de la blockchain...');

  // Verificar que la conexión WebSocket esté activa
  web3Ws.eth.net.isListening()
    .then(() => {
      console.log('Conexión WebSocket verificada, comenzando a escuchar eventos...');

      // Conectar con el contrato en la blockchain utilizando WebSocket
      const contrato = new web3Ws.eth.Contract(abi, contractAddress);

      // Función genérica para guardar eventos en Firebase
      const guardarEventoEnFirebase = async (collectionName: string, data: any) => {
        try {
          const docRef = await addDoc(collection(db, collectionName), data);
          console.log(`Evento guardado en Firebase en la colección ${collectionName} con ID: ${docRef.id}`);
        } catch (error) {
          console.error('Error guardando evento en Firebase:', (error as Error).message);
        }
      };

      // Escuchar evento 'ConvocatoriaCreada'
      contrato.events.ConvocatoriaCreada({})
        .on('data', async (event: any) => {
          console.log('Evento ConvocatoriaCreada:', event);
          const { idConvocatoria, creador, timestamp } = event.returnValues;

          // Aquí también puedes ver qué datos se reciben del evento
          console.log("Datos del evento ConvocatoriaCreada:", {
            idConvocatoria,
            creador,
            timestamp,
          });

          await guardarEventoEnFirebase('ConvocatoriaCreada', {
            idConvocatoria,
            creador,
            timestamp,
            evento: 'ConvocatoriaCreada',
          });
        });

      // Escuchar evento 'PostulantesAgregados'
      contrato.events.PostulantesAgregados({})
        .on('data', async (event: any) => {
          console.log('Evento PostulantesAgregados:', event);
          const { idConvocatoria, idPostulantes, timestamp } = event.returnValues;

          await guardarEventoEnFirebase('PostulantesAgregados', {
            idConvocatoria,
            idPostulantes,
            timestamp,
            evento: 'PostulantesAgregados',
          });
        });

      // Escuchar evento 'EstadoConvocatoriaActualizado'
      contrato.events.EstadoConvocatoriaActualizado({})
        .on('data', async (event: any) => {
          console.log('Evento EstadoConvocatoriaActualizado:', event);
          const { idConvocatoria, nuevoEstado } = event.returnValues;

          await guardarEventoEnFirebase('EstadoConvocatoriaActualizado', {
            idConvocatoria,
            nuevoEstado,
            evento: 'EstadoConvocatoriaActualizado',
          });
        });

      // Escuchar evento 'ConvocatoriaEliminada'
      contrato.events.ConvocatoriaEliminada({})
        .on('data', async (event: any) => {
          console.log('Evento ConvocatoriaEliminada:', event);
          const { idConvocatoria, eliminador } = event.returnValues;

          await guardarEventoEnFirebase('ConvocatoriaEliminada', {
            idConvocatoria,
            eliminador,
            evento: 'ConvocatoriaEliminada',
          });
        });

      // Escuchar evento 'PostulanteSeleccionado'
      contrato.events.PostulanteSeleccionado({})
        .on('data', async (event: any) => {
          console.log('Evento PostulanteSeleccionado:', event);
          const { idConvocatoria, idPostulante, fueSeleccionado } = event.returnValues;

          await guardarEventoEnFirebase('PostulanteSeleccionado', {
            idConvocatoria,
            idPostulante,
            fueSeleccionado,
            evento: 'PostulanteSeleccionado',
          });
        });

      // Escuchar evento 'CitacionEntrevista'
      contrato.events.CitacionEntrevista({})
        .on('data', async (event: any) => {
          console.log('Evento CitacionEntrevista:', event);
          const { idPostulante, fechaEntrevista, lugar } = event.returnValues;

          await guardarEventoEnFirebase('CitacionEntrevista', {
            idPostulante,
            fechaEntrevista,
            lugar,
            evento: 'CitacionEntrevista',
          });
        });

      // Escuchar evento 'ResultadoPostulante'
      contrato.events.ResultadoPostulante({})
        .on('data', async (event: any) => {
          console.log('Evento ResultadoPostulante:', event);
          const { idConvocatoria, idPostulante, esApto } = event.returnValues;

          await guardarEventoEnFirebase('ResultadoPostulante', {
            idConvocatoria,
            idPostulante,
            esApto,
            evento: 'ResultadoPostulante',
          });
        });

    })
    .catch((err) => {
      console.error('Error conectando al WebSocket:', err);
    });
};
