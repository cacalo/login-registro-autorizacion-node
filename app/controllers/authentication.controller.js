import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import {enviarMailVerificacion} from "./../services/nodemailer.service.js"

dotenv.config();
export const usuarios = [{
  user: 'pruebaprueba',
  email: 'contacto@puntojson.com',
  password: '$2a$05$QLPgOg6cjnd8MGgU85AzeuVJ5U9A3Nlf3DqUlJARM6Xcym0yk10Xa',
  verificado: false
}]

//Autenticación
async function login(req,res){
  try {
    const user = req.body.user.toLowerCase();
    const password = req.body.password;
    if(user === "" || password === ""){
      return res.status(400).json({status:"Error",message:"Formulario incompleto"})
    }
    const usuarioARevisar = usuarios.find(usuario => usuario.user === user);
    const loginCorrecto = await bcryptjs.compare(password,usuarioARevisar.password)
    if(loginCorrecto){
      const token = jsonwebtoken.sign(
        {user:usuarioARevisar.user},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRATION}
      )
      const cookiesOption = {
        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        path:"/"
      }
      res.cookie("jwt",token,cookiesOption);
      return res.json({ message: "Usuario loggeado",token,redirect:"./admin"});
    }
    res.status(401);
    return res.send({message: "Autenticación fallida"})

  }
  catch (err){
    res.status(400).send({status:"Error",message:err})
  }
}

async function registrar(req,res){
  try {
    if(req.body.user === ""
    || req.body.password === ""
    || req.body.email === ""){
      return res.status(400).json({status:"Error",message:"Formulario incompleto"})
    }
    const usuarioARevisar = usuarios.find(usuario => usuario.user === req.body.user);
    if(usuarioARevisar) {
      return res.status(301).send({status:"error",message:"Nombre de usuario ocupado."});
    }
    
    const password = req.body.password;
    const salt = await bcryptjs.genSalt(5);
    const passHash = await bcryptjs.hash(password,salt);

    const nuevoUsuario = {
      user:req.body.user,
      email:req.body.email.toLowerCase(),
      password: passHash
    }
    console.log("USUARIOS",usuarios)
    const tokenVerificacion = jsonwebtoken.sign(
      {user:nuevoUsuario.user},
      process.env.JWT_SECRET,
      {expiresIn:process.env.JWT_EXPIRATION}
    )
    const email = await enviarMailVerificacion(nuevoUsuario.email,tokenVerificacion);
    if(email.accepted.length === 0){
      return res.status(500).send({status:"error",message:`Problemas enviando email de verificacion`,redirect:"/"});
    }
    usuarios.push(nuevoUsuario);
    return res.status(201).send({status:"ok",message:`Usuario ${nuevoUsuario.user} registrado`,redirect:"/"});
  }
  catch (err){
    res.status(400).send({status:"Error",message:err})
  }
}

function verificarCuenta(req,res){
  try{
    if(!req.params.token) res.redirect("/");
    const decodificada = jsonwebtoken.verify(req.params.token, process.env.JWT_SECRET);
    if(!decodificada || !decodificada.user){
      return res.redirect("/").send({status:"error",message:"Error en el token"});
    }
    const indiceAActualizar = usuarios.findIndex(usuario => usuario.user === decodificada.user);
    usuarios[indiceAActualizar].verificado = true;
    
    //Una vez verificado el token
    const token = jsonwebtoken.sign(
      {user:usuarios[indiceAActualizar].user},
      process.env.JWT_SECRET,
  {expiresIn:process.env.JWT_EXPIRATION}
  )
  const cookiesOption = {
    expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    path:"/"
  }
  res.cookie("jwt",token,cookiesOption);
  return res.redirect("/admin") //res.json({ message: "Usuario loggeado",token,redirect:"./admin"});
} catch(error){
  res.status(500);
  res.redirect("/");
  //res.status(500).send({status:"error",message:error});
}


}



export const methods = {
  login,
  registrar,
  verificarCuenta
}