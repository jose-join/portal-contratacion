// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ConvocatoriaContract {
    struct Convocatoria {
        string idConvocatoria;
        address creador;
        uint256 timestamp;
        string[] postulantes;
        string estado;
        uint256 inicioConvocatoria;
        uint256 cierreConvocatoria;
        uint256 fechaEvaluacion;
        uint256 publicacionResultados;
    }

    struct Postulante {
        string idPostulante;
        string experiencia;
        string habilidades;
        string estado; // Nuevo campo para seguimiento de estado del postulante
        bool cumpleRequisitos;
        bool fueEntrevistado;
        bool fueSeleccionado; // Indica si fue seleccionado para la firma del contrato
    }

    // Mappings para almacenar convocatorias y postulantes
    mapping(string => Convocatoria) public convocatorias;
    mapping(string => Postulante[]) public postulantesConvocatoria;

    // Registro de todas las convocatorias
    string[] public listaConvocatorias;

    // Eventos
    event ConvocatoriaCreada(string idConvocatoria, address indexed creador, uint256 timestamp);
    event EstadoConvocatoriaActualizado(string idConvocatoria, string nuevoEstado);
    event PostulantesAgregados(string idConvocatoria, string[] idPostulantes, uint256 timestamp);
    event ConvocatoriaEliminada(string idConvocatoria, address indexed eliminador);
    event PostulanteSeleccionado(string idConvocatoria, string idPostulante, bool fueSeleccionado); 
    event CitacionEntrevista(string idPostulante, string fechaEntrevista, string lugar);
    event ResultadoPostulante(string idConvocatoria, string idPostulante, bool esApto);

    // Función para crear una convocatoria
    function crearConvocatoria(
        string memory _idConvocatoria,
        uint256 _inicioConvocatoria,
        uint256 _cierreConvocatoria,
        uint256 _fechaEvaluacion,
        uint256 _publicacionResultados
    ) public {
        require(bytes(_idConvocatoria).length > 0, "El ID de la convocatoria es requerido");
        require(convocatorias[_idConvocatoria].timestamp == 0, "Convocatoria ya existe");

        convocatorias[_idConvocatoria] = Convocatoria({
            idConvocatoria: _idConvocatoria,
            creador: msg.sender,
            timestamp: block.timestamp,
            postulantes: new string[](0),
            estado: "No Iniciada",
            inicioConvocatoria: _inicioConvocatoria,
            cierreConvocatoria: _cierreConvocatoria,
            fechaEvaluacion: _fechaEvaluacion,
            publicacionResultados: _publicacionResultados
        });

        listaConvocatorias.push(_idConvocatoria);
        emit ConvocatoriaCreada(_idConvocatoria, msg.sender, block.timestamp);
    }

    // Función para cambiar el estado de la convocatoria
    function actualizarEstadoConvocatoria(string memory _idConvocatoria, string memory nuevoEstado) public {
        require(convocatorias[_idConvocatoria].timestamp != 0, "La convocatoria no existe");
        convocatorias[_idConvocatoria].estado = nuevoEstado;
        emit EstadoConvocatoriaActualizado(_idConvocatoria, nuevoEstado);
    }

    // Agregar postulantes a la convocatoria
    function agregarPostulantes(
        string memory _idConvocatoria,
        string[] memory _idPostulantes,
        string[] memory _experiencia,
        string[] memory _habilidades,
        bool[] memory _cumpleRequisitos
    ) public {
        require(convocatorias[_idConvocatoria].timestamp != 0, "La convocatoria no existe");
        require(_idPostulantes.length > 0, "Debe haber al menos un postulante");

        Postulante[] storage postulantesExistentes = postulantesConvocatoria[_idConvocatoria];

        for (uint256 i = 0; i < _idPostulantes.length; i++) {
            postulantesExistentes.push(
                Postulante({
                    idPostulante: _idPostulantes[i],
                    experiencia: _experiencia[i],
                    habilidades: _habilidades[i],
                    estado: "Postulado",  // Estado inicial del postulante
                    cumpleRequisitos: _cumpleRequisitos[i],
                    fueEntrevistado: false,
                    fueSeleccionado: false
                })
            );
        }

        emit PostulantesAgregados(_idConvocatoria, _idPostulantes, block.timestamp);
    }

    // Función para que el administrador seleccione postulantes para la entrevista
    function seleccionarParaEntrevista(string memory _idConvocatoria, string memory _idPostulante, string memory fechaEntrevista, string memory lugar) public {
        Postulante[] storage postulantes = postulantesConvocatoria[_idConvocatoria];
        for (uint256 i = 0; i < postulantes.length; i++) {
            if (keccak256(bytes(postulantes[i].idPostulante)) == keccak256(bytes(_idPostulante))) {
                postulantes[i].fueEntrevistado = true;
                postulantes[i].estado = "Entrevista Programada";
                emit CitacionEntrevista(_idPostulante, fechaEntrevista, lugar);
                break;
            }
        }
    }

    // Función para que el administrador ponga el resultado de un postulante tras la evaluación
    function evaluarPostulante(string memory _idConvocatoria, string memory _idPostulante, bool esApto) public {
        Postulante[] storage postulantes = postulantesConvocatoria[_idConvocatoria];
        for (uint256 i = 0; i < postulantes.length; i++) {
            if (keccak256(bytes(postulantes[i].idPostulante)) == keccak256(bytes(_idPostulante))) {
                postulantes[i].estado = esApto ? "Apto" : "No Apto";
                postulantes[i].fueSeleccionado = esApto;
                emit ResultadoPostulante(_idConvocatoria, _idPostulante, esApto);
                break;
            }
        }
    }

    // Función para obtener el estado de un postulante
    function obtenerEstadoPostulante(string memory _idConvocatoria, string memory _idPostulante) public view returns (string memory) {
        Postulante[] storage postulantes = postulantesConvocatoria[_idConvocatoria];
        for (uint256 i = 0; i < postulantes.length; i++) {
            if (keccak256(bytes(postulantes[i].idPostulante)) == keccak256(bytes(_idPostulante))) {
                return postulantes[i].estado;
            }
        }
        return "Postulante no encontrado";
    }

    // Función para obtener todos los postulantes de una convocatoria
    function obtenerPostulantes(string memory _idConvocatoria) public view returns (Postulante[] memory) {
        require(convocatorias[_idConvocatoria].timestamp != 0, "La convocatoria no existe");
        return postulantesConvocatoria[_idConvocatoria];
    }

    // Función para obtener el detalle de una convocatoria
    function obtenerConvocatoria(string memory _idConvocatoria) public view returns (Convocatoria memory) {
        require(convocatorias[_idConvocatoria].timestamp != 0, "La convocatoria no existe");
        return convocatorias[_idConvocatoria];
    }

    // Función para listar todas las convocatorias
    function listarConvocatorias() public view returns (string[] memory) {
        return listaConvocatorias;
    }

    // Función para contar el total de convocatorias
    function contarConvocatorias() public view returns (uint256) {
        return listaConvocatorias.length;
    }

    // Función para contar los postulantes de una convocatoria
    function contarPostulantes(string memory _idConvocatoria) public view returns (uint256) {
        require(convocatorias[_idConvocatoria].timestamp != 0, "La convocatoria no existe");
        return postulantesConvocatoria[_idConvocatoria].length;
    }

    // Función para eliminar una convocatoria
    function eliminarConvocatoria(string memory _idConvocatoria) public {
        Convocatoria memory convocatoria = convocatorias[_idConvocatoria];
        require(convocatoria.timestamp != 0, "Convocatoria no encontrada");
        require(msg.sender == convocatoria.creador, "No tienes permiso para eliminar esta convocatoria");

        delete convocatorias[_idConvocatoria];
        emit ConvocatoriaEliminada(_idConvocatoria, msg.sender);

        for (uint256 i = 0; i < listaConvocatorias.length; i++) {
            if (keccak256(bytes(listaConvocatorias[i])) == keccak256(bytes(_idConvocatoria))) {
                listaConvocatorias[i] = listaConvocatorias[listaConvocatorias.length - 1];
                listaConvocatorias.pop();
                break;
            }
        }
    }

    // Función para verificar si una convocatoria existe
    function existeConvocatoria(string memory _idConvocatoria) public view returns (bool) {
        return convocatorias[_idConvocatoria].timestamp != 0;
    }
}
