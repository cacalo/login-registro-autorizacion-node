import jsonwebtoken from "jsonwebtoken";
import {usuarios} from "./../controllers/authentication.controller.js";

//Autorización
function soloAdmin(req,res,next){
  if(req.headers.cookie){
    if(revisarValidezCookie(req)) return next();
  }
  return res.redirect("/")
}

function soloPublico(req,res,next){
  if(req.headers.cookie){
    if(!revisarValidezCookie(req)) return next();
  }
  return res.redirect("/admin")
}

function revisarValidezCookie(req){
  try{
    const cookieJTW = req.headers.cookie.split('; ').find(cookie => cookie.startsWith("jwt")).substring(4);
    const decodificada = jsonwebtoken.verify(cookieJTW, process.env.JWT_SECRET);
    let result = usuarios.find(usuario => usuario.user === decodificada.user);
    if(!result || !result.verificado){
      return false;
    }
    req.body.user=result;
    return true
  }
  catch{
    return false
  }
}


export const methods = {
  soloAdmin,
  soloPublico
}