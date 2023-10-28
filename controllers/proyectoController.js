import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
    // const proyectos = await Proyecto.find({
    //     creador: req.usuario
    // })
    // const proyectos = await Proyecto.find()
    //                                 .where('creador')
    //                                 .equals(req.usuario)
    //                                 .select('-tareas')
    const proyectos = await Proyecto.find({
        '$or': [
            {'colaboradores': { $in: req.usuario }},
            {'creador': { $in: req.usuario }}
        ]
    }).select('-tareas')

    res.json(proyectos)
};

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch (error) {
        console.log(error);
    }
};

const obtenerProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id)
    // .populate('tareas')
    .populate({ path: 'tareas', populate: { path: 'completado', select: 'nombre' } })
    .populate('colaboradores', "nombre email")

    // Obtener las tareas del Proyecto
    // const tareas = await Tarea.find().where('proyecto').equals(proyecto._id)

    if (!proyecto) {
        const error = new Error("No Encontrado");
        return res.status(404).json({ msg: error.message });
    }

    if ( proyecto.creador.toString() !==  req.usuario._id.toString() && !proyecto.
    colaboradores.some( colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error('Accion no Valida')
        return res.status(401).json({ msg: error.message })
    }
    
    res.json(
        proyecto,
        // tareas
    )

};

const editarProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id);

    if ( !proyecto ) {
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if ( proyecto.creador.toString() !==  req.usuario._id.toString()) {
        const error = new Error('Accion no Valida')
        return res.status(401).json({ msg: error.message })
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.cliente = req.body.cliente || proyecto.cliente;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error);
    }

};

const eliminarProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id);

    if ( !proyecto ) {
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if ( proyecto.creador.toString() !==  req.usuario._id.toString()) {
        const error = new Error('Accion no Valida')
        return res.status(401).json({ msg: error.message })
    }

    try {
        await proyecto.deleteOne();
        res.json({ msg: 'Proyecto Eliminado' })
    } catch (error) {
        console.log(error);
    }
};

const buscarColaborador = async (req, res) => {
    const { email } = req.body;
    
    const usuario = await Usuario.findOne({email}).select(
    '-confirmado -createdAt -password -token -updatedAt -__v')

    if( !usuario ) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({msg: error.message});
    }

    res.json(usuario)
};

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if ( !proyecto ) {
        const error = new Error('Proyecto No Encontrado');
        return res.status(404).json({msg: error.message});
    }

    if( proyecto.creador.toString() !== req.usuario._id.toString() ) {
        const error = new Error('Accion no valida');
        return res.status(404).json({msg: error.message});
    }

    const { email } = req.body;
    
    const usuario = await Usuario.findOne({email}).select(
    '-confirmado -createdAt -password -token -updatedAt -__v')

    if( !usuario ) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({msg: error.message});
    }

    // EL colaborador no es el admin del proyecto
    if ( proyecto.creador.toString() === usuario._id.toString() ) {
        const error = new Error('El Creador del Proyecto no puede ser colaborador')
        return res.status(404).json({msg: error.message});
    }

    // Revisar que no este ya agregado al proyecto
    if ( proyecto.colaboradores.includes(usuario._id) ) {
        const error = new Error('El usuario ya pertence al proyecto')
        return res.status(404).json({msg: error.message});
    }

    // Esta bie, se puede agregar
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save()
    res.json({msg: 'Colaborador Agregado Correctamente'})

};

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if ( !proyecto ) {
        const error = new Error('Proyecto No Encontrado');
        return res.status(404).json({msg: error.message});
    }

    if( proyecto.creador.toString() !== req.usuario._id.toString() ) {
        const error = new Error('Accion no valida');
        return res.status(404).json({msg: error.message});
    }

    const { email } = req.body;
    

    // Esta bie, se puede eliminar
    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save()
    res.json({msg: 'Colaborador Eliminado Correctamente'})
};


// Ya no necesario porque obtenemos tareas en la funcion de obtener proyecto
// const obtenerTareas = async (req, res) => {
//     const { id } = req.params
//     const existeProyecto = await Proyecto.findById(id);

//     if ( !existeProyecto ) {
//         const error = new Error('No encontrado')
//         return res.status(404).json({ msg: error.message })
//     }

//     // Tienes que ser el creador del proyecto o colaborador
//     // const tareas = await Tarea.find({ proyecto: existeProyecto })
//     const tareas = await Tarea.find().where('proyecto').equals(id)

//     res.json(tareas)

// };

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  eliminarColaborador,
  buscarColaborador
//   obtenerTareas,
};
