// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Convocatoria {
    // Estructura para almacenar los datos de una convocatoria
    struct ConvocatoriaStruct {
        string titulo;
        string descripcion;
        string formacionAcademica;
        string experienciaLaboral;
        string habilidadesTecnicas;
        string competencias;

        // Documentos Requeridos
        bool cv;
        bool dni;
        bool certificadosEstudios;
        bool certificadosTrabajo;
        bool declaracionJurada;

        // Proceso de Selección
        bool evaluacionCurricular;
        bool entrevistaPersonal;
        bool evaluacionTecnica;
        bool evaluacionPsicologica;

        // Condiciones Laborales
        string tipoContrato;
        string salario;
        string jornadaLaboral;

        // Fechas Importantes
        string inicioConvocatoria;
        string cierreConvocatoria;
        string fechaEvaluacion;
        string publicacionResultados;

        // Lugar de trabajo
        string lugarTrabajo;

        // Metadata
        address creador;
        uint256 fechaCreacion;
    }

    // Array dinámico para almacenar las convocatorias
    ConvocatoriaStruct[] public convocatorias;

    // Evento para hacer seguimiento de las convocatorias creadas
    event ConvocatoriaCreada(
        uint256 indexed id,
        string titulo,
        address indexed creador,
        uint256 fechaCreacion
    );

    // Función para crear una nueva convocatoria
    function crearConvocatoria(
        string memory _titulo,
        string memory _descripcion,
        string memory _formacionAcademica,
        string memory _experienciaLaboral,
        string memory _habilidadesTecnicas,
        string memory _competencias,
        bool _cv,
        bool _dni,
        bool _certificadosEstudios,
        bool _certificadosTrabajo,
        bool _declaracionJurada,
        bool _evaluacionCurricular,
        bool _entrevistaPersonal,
        bool _evaluacionTecnica,
        bool _evaluacionPsicologica,
        string memory _tipoContrato,
        string memory _salario,
        string memory _jornadaLaboral,
        string memory _inicioConvocatoria,
        string memory _cierreConvocatoria,
        string memory _fechaEvaluacion,
        string memory _publicacionResultados,
        string memory _lugarTrabajo
    ) public {
        // Crear una nueva convocatoria y agregarla al array
        convocatorias.push(ConvocatoriaStruct({
            titulo: _titulo,
            descripcion: _descripcion,
            formacionAcademica: _formacionAcademica,
            experienciaLaboral: _experienciaLaboral,
            habilidadesTecnicas: _habilidadesTecnicas,
            competencias: _competencias,
            cv: _cv,
            dni: _dni,
            certificadosEstudios: _certificadosEstudios,
            certificadosTrabajo: _certificadosTrabajo,
            declaracionJurada: _declaracionJurada,
            evaluacionCurricular: _evaluacionCurricular,
            entrevistaPersonal: _entrevistaPersonal,
            evaluacionTecnica: _evaluacionTecnica,
            evaluacionPsicologica: _evaluacionPsicologica,
            tipoContrato: _tipoContrato,
            salario: _salario,
            jornadaLaboral: _jornadaLaboral,
            inicioConvocatoria: _inicioConvocatoria,
            cierreConvocatoria: _cierreConvocatoria,
            fechaEvaluacion: _fechaEvaluacion,
            publicacionResultados: _publicacionResultados,
            lugarTrabajo: _lugarTrabajo,
            creador: msg.sender,
            fechaCreacion: block.timestamp
        }));

        // Emitir un evento para hacer seguimiento de la convocatoria creada
        emit ConvocatoriaCreada(
            convocatorias.length - 1,
            _titulo,
            msg.sender,
            block.timestamp
        );
    }

    // Función para obtener una convocatoria por su ID
    function obtenerConvocatoria(uint256 _id) public view returns (ConvocatoriaStruct memory) {
        require(_id < convocatorias.length, "Convocatoria no encontrada.");
        return convocatorias[_id];
    }

    // Función para obtener el número total de convocatorias
    function obtenerTotalConvocatorias() public view returns (uint256) {
        return convocatorias.length;
    }

    // Función para obtener todas las convocatorias creadas por un usuario específico
    function obtenerConvocatoriasPorCreador(address _creador) public view returns (ConvocatoriaStruct[] memory) {
        uint256 total = obtenerTotalConvocatorias();
        uint256 count = 0;

        // Contar cuántas convocatorias ha creado el usuario
        for (uint256 i = 0; i < total; i++) {
            if (convocatorias[i].creador == _creador) {
                count++;
            }
        }

        // Crear un nuevo array para almacenar las convocatorias del usuario
        ConvocatoriaStruct[] memory result = new ConvocatoriaStruct[](count);
        uint256 j = 0;

        // Agregar las convocatorias del usuario al array
        for (uint256 i = 0; i < total; i++) {
            if (convocatorias[i].creador == _creador) {
                result[j] = convocatorias[i];
                j++;
            }
        }

        return result;
    }
}
