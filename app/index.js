import express from "express";
import cookieParser from 'cookie-parser';
//Fix para __direname
import path from 'path';
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import {methods as authentication} from "./controllers/authentication.controller.js";
import {methods as authorization} from "./middlewares/authorization.js";

//Server
const app = express();
app.set("port",4000);
app.listen(app.get("port"));
console.log("Servidor iniciado en puerto", app.get("port"));

//Settings
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(cookieParser());

//Routes
app.get("/",authorization.soloPublico,(req,res)=> res.sendFile(__dirname +"/pages/login.html"));
app.get("/registro",authorization.soloPublico,(req,res)=> res.sendFile(__dirname +"/pages/registro.html"));
app.get("/admin",authorization.soloAdmin ,(req,res)=> res.sendFile(__dirname +"/pages/admin/admin.html"));
app.post("/api/registrar", authentication.registrar);
app.post("/api/login", authentication.login);
app.get("/verificar/:token", authentication.verificarCuenta);