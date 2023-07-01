const form = document.getElementById("login-form");
const mensajeError = document.getElementsByClassName("error")[0];

form.addEventListener("submit",async (e)=>{
  e.preventDefault();
  mensajeError.classList.toggle("escondido",true);
  const res = await fetch("http://localhost:4000/api/login",{
    method:"POST",
    headers:{
      "Content-type" : "application/json"
    },
    body:JSON.stringify({
      user:e.target.elements.user.value,
      password: e.target.elements.password.value
    })
  });
  if(res.ok){
    const resJson = await res.json();
    if(resJson.redirect){
      return window.location.href=resJson.redirect;
    }
  }
  mensajeError.classList.toggle("escondido",false);
})