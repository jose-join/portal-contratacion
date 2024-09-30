import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Cargar las variables de entorno desde .env
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",  // Especifica la versión correcta de Solidity
    settings: {
      optimizer: {
        enabled: true,    // Habilita el optimizador de Solidity
        runs: 200,        // Número de ejecuciones de optimización
      },
      viaIR: true,        // Habilita la optimización a través de IR
    },
  },
  networks: {
    optimism: {
      url: process.env.ALCHEMY_API_URL || '', // URL de Alchemy desde el archivo .env
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],  // Clave privada desde el archivo .env
    },
  },
  defaultNetwork: "optimism",  // Configurar la red predeterminada como "optimism"
};

export default config;
