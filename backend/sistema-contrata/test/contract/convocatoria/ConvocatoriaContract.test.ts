import Web3 from "web3";
import { assert } from "chai";
import { Contract } from "web3-eth-contract";
import * as dotenv from "dotenv";
dotenv.config();

const ConvocatoriaContractJSON = require("../artifacts/contracts/ConvocatoriaContract.sol/ConvocatoriaContract.json");

describe("ConvocatoriaContract", function () {
  let web3: Web3;
  let convocatoriaContract: Contract<typeof ConvocatoriaContractJSON.abi>;
  let accounts: string[];

  before(async function () {
    web3 = new Web3("http://127.0.0.1:8545"); // Conectar a la red de prueba local de Hardhat

    accounts = await web3.eth.getAccounts();
    const deployContract = new web3.eth.Contract(ConvocatoriaContractJSON.abi);
    convocatoriaContract = await deployContract
      .deploy({ data: ConvocatoriaContractJSON.bytecode })
      .send({ from: accounts[0], gas: "1500000" });
  });

  it("Debería crear una nueva convocatoria", async function () {
    const idConvocatoria = "convocatoria1";
    const inicioConvocatoria = Math.floor(Date.now() / 1000);
    const cierreConvocatoria = inicioConvocatoria + 60 * 60 * 24 * 7; // +7 días
    const fechaEvaluacion = cierreConvocatoria + 60 * 60 * 24; // +1 día
    const publicacionResultados = fechaEvaluacion + 60 * 60 * 24 * 2; // +2 días

    await convocatoriaContract.methods.crearConvocatoria(
      idConvocatoria,
      inicioConvocatoria,
      cierreConvocatoria,
      fechaEvaluacion,
      publicacionResultados
    ).send({ from: accounts[0] });

    const convocatoria = await convocatoriaContract.methods.obtenerConvocatoria(idConvocatoria).call();
    assert.equal(convocatoria.idConvocatoria, idConvocatoria, "El ID de la convocatoria no coincide");
    assert.equal(convocatoria.creador, accounts[0], "El creador de la convocatoria no es el esperado");
  });

  it("Debería agregar postulantes a una convocatoria", async function () {
    const idConvocatoria = "convocatoria1";
    const postulantes = ["postulante1", "postulante2"];
    const experiencia = ["2 años", "3 años"];
    const habilidades = ["solidez técnica", "habilidades analíticas"];
    const cumpleRequisitos = [true, false];

    await convocatoriaContract.methods.agregarPostulantes(
      idConvocatoria,
      postulantes,
      experiencia,
      habilidades,
      cumpleRequisitos
    ).send({ from: accounts[0] });

    const estadoPostulante = await convocatoriaContract.methods.obtenerEstadoPostulante(idConvocatoria, postulantes[0]).call();
    assert.equal(estadoPostulante, "Postulado", "El estado del postulante no es 'Postulado'");
  });

  it("Debería actualizar el estado de la convocatoria", async function () {
    const idConvocatoria = "convocatoria1";
    const nuevoEstado = "En Curso";

    await convocatoriaContract.methods.actualizarEstadoConvocatoria(idConvocatoria, nuevoEstado).send({ from: accounts[0] });

    const convocatoria = await convocatoriaContract.methods.obtenerConvocatoria(idConvocatoria).call();
    assert.equal(convocatoria.estado, nuevoEstado, "El estado de la convocatoria no se actualizó correctamente");
  });

  it("Debería evaluar un postulante como apto", async function () {
    const idConvocatoria = "convocatoria1";
    const postulanteId = "postulante1";

    await convocatoriaContract.methods.evaluarPostulante(idConvocatoria, postulanteId, true).send({ from: accounts[0] });

    const estado = await convocatoriaContract.methods.obtenerEstadoPostulante(idConvocatoria, postulanteId).call();
    assert.equal(estado, "Apto", "El estado del postulante no es 'Apto' después de la evaluación");
  });
});
