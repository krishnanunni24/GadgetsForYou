const loginForm = document.getElementById("login-form");
const baseUrl='http://localhost:3000/'
 let mobileNumber;
  loginForm.addEventListener("submit", (e) => { e.preventDefault();
     mobileNumber = parseInt(document.getElementById("phoneInput").value); 
     if (isNaN(mobileNumber)) {
         alert("Invalid Phone Number")
         } else {
             // process
             sendVerificationCode(mobileNumber)
         }

  })

  async function sendVerificationCode(mobileNumber){
    const res=await axios.post(baseUrl+'/send-verification-otp',{mobileNumber})
    console.log(res)
  }