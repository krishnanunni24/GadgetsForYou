function nameValidation() {
    const name = document.getElementById('inputName').value.trim()
    const spanName = document.getElementById('nameDiv')
    if (name.length > 0) {
      spanName.innerHTML = 'Name is valid'
      spanName.style.color = 'green'
      return true
    }

    else {
      spanName.innerHTML = 'Username is Required'
      spanName.style.color = 'red'
      return false
    }


  }

  function passwordValidation() {
    const password = document.getElementById('inputPassword').value.trim()
    let spanPassword = document.getElementById('passwordDiv')
    if (password.length >=6) {
      spanPassword.innerHTML = 'Password is valid'
      spanPassword.style.color = 'green'
    }
    else {
      spanPassword.innerHTML = '6 Letter Password is required'
      spanPassword.style.color = 'red'
    }

  }

  function confirmPasswordValidation() {
    const password = document.getElementById('inputPassword').value.trim()
    const confirmPassword = document.getElementById('inputConfirmPassword').value.trim()
    let spanConfirmPassword = document.getElementById('confirmPasswordDiv')
    if (confirmPassword.length >=6 && confirmPassword==password ) {
      spanConfirmPassword.innerHTML = 'Passwords match'
      spanConfirmPassword.style.color = 'green'
    }
    else {
      spanConfirmPassword.style.color = 'red'
      spanConfirmPassword.innerHTML = 'Passwords not matching'
      
    }

  }


  function emailValidation() {
    const email = document.getElementById('inputEmail').value.trim()
    let spanEmail = document.getElementById('emailDiv')
    if (email.length > 9) {
      spanEmail.innerHTML = 'Email is valid'
      spanEmail.style.color = 'green'
    }
    else {
      spanEmail.innerHTML = 'Valid Email is required'
      spanEmail.style.color = 'red'
    }

  }

  function phoneValidation() {
    const phone = document.getElementById('inputPhone').value.trim()
    let spanPhone = document.getElementById('phoneDiv')
    if (phone.length==10) {
      spanPhone.innerHTML = 'Phone No is Valid'
      spanPhone.style.color = 'green'
    } else {
      spanPhone.innerHTML = 'Phone number is not Valid'
      spanPhone.style.color = 'red'
    }
  }
