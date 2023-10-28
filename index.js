import express from 'express'
import dotenv from "dotenv";
import cors from 'cors';
import conectarDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';


// es como elmarchiv config.py y urls.py principal del proyecto

const app = express();
// para que pueda procesar/leer la informacion que viene en tipo json
app.use(express.json())

dotenv.config();

conectarDB();

// Cnnfigurar CORS
const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function(origin, callback) {
        if ( whitelist.includes(origin) ) {
            // Puede consultar la API
            callback(null, true);
        } else {
            // No esta permitido
            callback(new Error('Error de Cors'));
        }
    }
};

app.use(cors(corsOptions))

// Routing
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

// ".use" escucha por todos los verbos http
// app.use('/api/usuarios', (req, res) => {
//     res.json({msg: 'OK'})
// })
//  y se es especifico con ".get" ".post", etc
// app.get('/api/usuarios', (req, res) => {
//     res.json({msg: 'OK'})
// })

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
    console.log(` Servidor correindo en el puerto ${PORT}`);
})

// Socket.io
import { Server } from 'socket.io';

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
});

io.on('connection', socket => {
    console.log('Conectado a socket.io');

    // Definir los eventos de socket io
    socket.on('abrir proyecto', (proyecto) => {
        socket.join(proyecto);
    })

    socket.on('nueva tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('actualizar tarea', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada', tarea)
    })

    socket.on('cambiar estado', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea)
    })
})