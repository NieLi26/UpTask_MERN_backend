import express from "express";
import {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil
} from "../controllers/usuarioController.js";

import checkAuth from "../middleware/checkAuth.js";

// es como las urls.py de django

const router = express.Router();

// url, con logica de vista
// router.get('/', (req, res) => {
//     res.json('Desde API/USUARIOS')
// })

// url con importacion de controlador, como views.py de django
// router.get('/', usuarios)
// router.post('/', crearUsuario)

// Autenticacion, Registro y Confirmacion de Usuarios
router.post("/", registrar); // Crear un nuevo usuario
router.post("/login", autenticar);
router.get("/confirmar/:token", confirmar);
router.post("/olvide-password", olvidePassword);
// router.get('/olvide-password/:token', comprobarToken);
// router.post('/olvide-password/:token', nuevoPassword);
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword);
router.get('/perfil', checkAuth, perfil);


export default router;
