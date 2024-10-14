import admin from 'firebase-admin';

// Asegúrate de haber inicializado correctamente Firebase Admin SDK
const bucket = admin.storage().bucket();

export const subirDocumento = async (fileBuffer: Buffer, destinationPath: string): Promise<string> => {
  try {
    const file = bucket.file(destinationPath);
    
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'application/pdf',  // O el tipo de archivo adecuado
      },
    });

    stream.end(fileBuffer);

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    await file.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    throw new Error('Error al subir el archivo');
  }
};
