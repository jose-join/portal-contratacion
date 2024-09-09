import Web3 from 'web3';
import { readFileSync } from 'fs';
import path from 'path';

async function main() {
  // Configura el proveedor de Web3 para conectarse a la red local de Hardhat
  const web3 = new Web3('http://127.0.0.1:8545');  // Cambia la URL si estás usando otra red

  // Obtén la cuenta de despliegue
  const accounts = await web3.eth.getAccounts();
  const deployer = accounts[0];

  // Lee el ABI y el bytecode del contrato Convocatoria
  const contractPath = path.resolve(__dirname, '../artifacts/contracts/Convocatoria.sol/Convocatoria.json');
  const contractJson = JSON.parse(readFileSync(contractPath, 'utf8'));
  const abi: any = contractJson.abi;
  const bytecode = contractJson.bytecode;

  // Crea una instancia del contrato
  const Convocatoria = new web3.eth.Contract(abi);

  // Despliega el contrato
  const deployedContract = await Convocatoria.deploy({ data: bytecode })
  .send({ from: deployer, gas: "5000000" }); // Aumenta el límite de gas


  // Muestra la dirección del contrato desplegado
  console.log('Convocatoria deployed to:', deployedContract.options.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error deploying contract:', error);
    process.exit(1);
  });
