import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import BN from 'bn.js';  // Importar BN correctamente
require('dotenv').config();

// Obtener la ABI y el bytecode del contrato compilado
const contractPath = path.resolve(__dirname, '../artifacts/contracts/ConvocatoriaContract.sol/ConvocatoriaContract.json');
const { abi, bytecode } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

// Configuración de Web3 y cuenta
let privateKey = process.env.PRIVATE_KEY || '';
if (!privateKey.startsWith('0x')) {
  privateKey = `0x${privateKey}`;
}
const alchemyApiUrl = process.env.ALCHEMY_API_URL;

// Imprimir los valores para verificar
console.log("ALCHEMY_API_URL:", alchemyApiUrl);
console.log("Private Key Length:", privateKey.length);
console.log("Private Key (parcial):", privateKey.slice(0, 7), "...", privateKey.slice(-5));

const web3 = new Web3(alchemyApiUrl);  // Instanciación correcta

// Función principal para desplegar el contrato
const deploy = async () => {
  try {
    console.log('Creando cuenta desde la clave privada...');
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    console.log('Desplegando desde la cuenta:', account.address);

    // Obtener el balance de la cuenta en Wei y convertir a BN
    const balanceInWei = await web3.eth.getBalance(account.address);
    const balanceInBN = new BN(balanceInWei.toString());  // Convertir balanceInWei a string
    console.log('Balance de la cuenta:', web3.utils.fromWei(balanceInWei, 'ether'), 'ETH');

    // Asegurarse de que el saldo no sea cero
    if (balanceInBN.isZero()) {
      throw new Error('Fondos insuficientes para desplegar el contrato. Asegúrate de tener ETH en tu cuenta.');
    }

    // Crear una instancia del contrato con la ABI y el bytecode
    const contract = new web3.eth.Contract(abi);
    const deployTx = contract.deploy({
      data: bytecode,   // Bytecode del contrato
    });

    // Estimar el gas necesario para desplegar el contrato
    const gas = await deployTx.estimateGas();
    console.log('Gas estimado:', gas);

    // Obtener el precio del gas
    const gasPrice = await web3.eth.getGasPrice();
    console.log('Precio del gas:', gasPrice);

    // Calcular el costo total de gas
    const totalCost = new BN(gas.toString()).mul(new BN(gasPrice.toString()));
    if (balanceInBN.lt(totalCost)) {
      throw new Error('Fondos insuficientes para cubrir los costos de gas.');
    }

    // Desplegar el contrato
    const receipt = await deployTx.send({
      from: account.address,
      gas: gas.toString(),
      gasPrice: gasPrice.toString(),
    });

    console.log('Contrato desplegado en la dirección:', receipt.options.address);

    // Verificar si la carpeta "deployed" existe, y si no, crearla
    const deployedDir = path.resolve(__dirname, '../deployed');
    if (!fs.existsSync(deployedDir)) {
      fs.mkdirSync(deployedDir);
    }

    // Guardar la dirección del contrato en un archivo
    const deployedContract = {
      address: receipt.options.address,
      abi,
    };
    fs.writeFileSync(path.resolve(deployedDir, 'ConvocatoriaContractAddress.json'), JSON.stringify(deployedContract, null, 2));

    console.log('Dirección del contrato y ABI guardados en: deployed/ConvocatoriaContractAddress.json');

  } catch (error) {
    console.error('Error durante el despliegue del contrato:', error);
  }
};

deploy();
