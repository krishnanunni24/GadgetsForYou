const userHelpers = require('../helpers/user-Helpers');
var catagoryHelpers = require('../helpers/catagory-Helpers')
var productHelpers = require('../helpers/product-Helpers')
var cartHelpers=require('../helpers/cart-Helpers')
var orderHelpers=require('../helpers/order-helpers');
const { Db } = require('mongodb');
require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken =process.env.TWILIO_AUTH_TOKEN
const serverSID=process.env.VERIFICATION_SID

const client = require('twilio')(accountSid, authToken);



//landing page
const landingPage=(req, res, next) => {
  let user=null
    catagoryHelpers.getAllCatagory().then((catagory) => {
      productHelpers.getAllProducts().then((products) => {
        res.render('user/landingPage', { catagory, products ,user:false});
      })
    })
  }

//User Login
const loginPost= (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    req.session.user=response.userData
    if (response.status === true) {
      userHelpers.blockCheck(req.body.email).then((response) => {
        if (response.status === true) {
          req.session.userLoggedIn = true
          req.session.userBlocked=false
          console.log(response)
          res.redirect('/userPanel')
        } else {
          req.session.userBlocked = true
          req.flash('failed', 'This user is Blocked')
          res.redirect('/login')
        }
      })
    } else {
      req.session.userLoginErr = true
      res.redirect('/login')
    }
  })
}

const loginGet= (req, res, next) => {
  if (req.session.userLoggedIn) {
    res.redirect('/userPanel')
  } else {
    res.render('user/userLogin', { 'loggInErr': req.session.userLoginErr ,'userBlocked':req.session.userBlocked});
  }
  req.session.userLoginErr = false
  req.session.userBlocked = false
}

//User SignUp
const signUpGet=(req, res) =>{
  res.render('user/signup')
}

const signUpPost= (req, res) => {
  userHelpers.addUser(req.body).then(() => {
    res.redirect('/login')
  })
}

//UserHome
const userPanelGet= async (req, res)=>{
 let user=null
 let cartCount=null

 
 if(req.session.user){
  user=req.session.user
  cartCount=await cartHelpers.getCartCount(user._id)
 }
  productHelpers.getAllProducts().then((products) => {
    catagoryHelpers.getAllCatagory().then((catagory) => {
      res.render('user/landingPage', { catagory, products ,user,cartCount})
    })
  })
}


//Product Display
const displayProduct=async(req, res) => {
  let user=null
 let cartCount=null
 if(req.session.user){
  user=req.session.user
  cartCount=await cartHelpers.getCartCount(user._id)
 }
  let product=await userHelpers.getProduct(req.params.id)
  console.log("id",req.params.id)
  console.log('products:',product)
    res.render('user/displayProduct', {product,user,cartCount})
}

//Catagories
const catagory=async(req, res) =>{
  let user=null
  let cartCount=null
  if(req.session.user){
    user=req.session.user
    cartCount=await cartHelpers.getCartCount(user._id)

  }
  productHelpers.getProductCatogaryWise(req.params.id).then((products) => {
    res.render('user/catagoryWise', { products,user,cartCount })
  })
}

//otp
const otpPhone=function(req,res){
  res.render('user/otpPhone',{'otpErr':req.session.otpErr}) 
  req.session.otpErr=false 
}

const otpLoginPost=async function (req, res, next) {
  const  phone  = req.body.phone
  userHelpers.getUserByphno(phone).then((response) => {
    const user = response
    if (!user) {
      req.flash('failed', 'User does not exist')
      res.redirect('/otpPhone')
    }
    else if (user.loginAccess=='blocked') {
      // req.flash('failed', 'You are blocked by Admin')
      res.redirect('/otpPhone')
    }
    else {
      client.verify
        .services(serverSID)
        .verifications.create({
          to: `+91${phone}`,
          channel: 'sms'
        }).then(data => {
          console.log(data);
          res.render('user/otpVerify', { phone: req.body.phone, user: false })
        })
        .catch(err => {
          console.log(err);
        })
    }
  })
}

const otpLoginVerification= (req, res, next) => {
  res.render('otpVerify', { user: false, phone: null })
}
const otpVerifyPost= (req, res, next) => {
  const { otp, phone } = req.body
  console.log(phone);
  client.verify.services(serverSID).verificationChecks.create({ to: `+91${phone}`, code: otp })
    .then(async (resp) => {
      console.log(req.body.phone);
      if (!resp.valid) {
        // req.flash('failed', 'OTP verification failed')  
        req.session.otpErr=true 
        res.redirect('/otpPhone')
      } else {
        userHelpers.getUserByphno(phone).then((response) => {
          const user = response
          req.session.user = user
          req.session.userLoggedIn=true
          // req.flash('success', 'OTP verification successfully completed and you are Logged in')
          res.redirect('/login')
        })
      }
    }).catch(err => {
      console.log(err);
    })
}

const addToCart=(req,res)=>{
 var userID= req.session.user._id
  cartHelpers.addToCart(req.params.id,userID).then(()=>{
      res.json({status:true})
  })
}

const cart=async(req,res)=>{
  let user=req.session.user
  let cartCount=null
  let totalValue=null
 if(req.session.user){
  cartCount=await cartHelpers.getCartCount(user._id)
  totalValue=await cartHelpers.getTotalValue(user._id)
 }
  cartHelpers.getAllCartItems(req.session.user._id).then((products)=>{
    res.render('user/userCart',{products,user,cartCount,totalValue})
  })
}

const logout = (req,res)=>{
  req.session.destroy()
  res.redirect('/login')
}

const cartDelete=(req,res)=>{
  cartHelpers.cartDelete(req.params.id,req.session.user._id).then(()=>{
  res.json({status:true})
  })
}

const changeProductQuantity=(req,res)=>{
  cartHelpers.changeQuantity(req.body).then(async(response)=>{
    cartHelpers.getTotalValue(req.body.user).then((data)=>{

      response.total=data[0]?.total

      res.json(response)
    })    
  })
}

const placeOrder=async(req,res)=>{
  let totalValue=null
  let cartCount=null
  let address=null
  let user=null
  if(req.session.user){
    cartCount=await cartHelpers.getCartCount(req.session.user._id)
    totalValue=await cartHelpers.getTotalValue(req.session.user._id)
    address=await userHelpers.getAlladdress(req.session.user._id)
    user=await userHelpers.getUser(req.session.user._id)

    }

  res.render('user/placeOrder',{totalValue,address,cartCount,user})
}

const addAddress=(req,res)=>{
  res.render('user/addAddress')
}

const userProfile=async(req,res)=>{
  let cartCount=null
 let user=null
  if(req.session.user){
   cartCount=await cartHelpers.getCartCount(req.session.user._id)
   user=await userHelpers.getUser(req.session.user._id)
  }
  res.render('user/userProfile',{cartCount,user})
}

const editProfileGet=async(req,res)=>{
  let cartCount=null
  user=req.session.user
  if(req.session.user){
   cartCount=await cartHelpers.getCartCount(user._id)
  }
  res.render('user/editProfile',{cartCount,user})
}

const addAddressPost=(req,res)=>{
  
  userHelpers.addAddress(req.body,req.session.user._id).then(()=>{
    console.log('Address added');
    res.redirect('/placeOrder')
})
  

}

const removeAddress=(req,res)=>{
 let addressId=req.params.id
  userHelpers.removeAddress(req.session.user._id,addressId).then(()=>{
    res.redirect('/placeOrder')
  })
}

const profileAddress=async(req,res)=>{
  let cartCount=null
  let user=null
  let address=null
  if(req.session.user){
    user=await userHelpers.getUser(req.session.user._id)
   cartCount=await cartHelpers.getCartCount(user._id)
   address=await userHelpers.getAlladdress(req.session.user._id)
  }
  res.render('user/profileAddress',{cartCount,user,address})
}

const editProfilePost=(req,res)=>{
  let userId=req.session.user._id
  userHelpers.editProfile(userId,req.body).then(()=>{
    res.redirect('/userProfile')
  })
}

const profileAddAddressGet=async(req,res)=>{
  let cartCount=null
  let user=req.session.user
  let address=null
  if(req.session.user){
   cartCount=await cartHelpers.getCartCount(user._id)
   address=await userHelpers.getAlladdress(req.session.user._id)
  }

    res.render('user/profileAddAddress',{cartCount,user,address})
}

const profileAddAddressPost=(req,res)=>{
  userHelpers.addAddress(req.body,req.session.user._id).then(()=>{
    console.log('Address added');
    res.redirect('/profileAddress')
})
}

const profileRemoveAddress=(req,res)=>{
  let addressId=req.params.id
   userHelpers.removeAddress(req.session.user._id,addressId).then(()=>{
     res.redirect('/profileAddress')
   })
}

const placeOrderPost=async(req,res)=>{
  let data=req.body
  let userId=req.session.user._id
  data.date=new Date().toJSON().slice(0,10)
  data.orderDetails=await userHelpers.getAddress(userId,data.address)
  data.products=await cartHelpers.getAllCartItems(req.session.user._id)
  orderHelpers.addOrder(req.session.user._id,data).then((response)=>{
    cartHelpers.removeAll(req.session.user._id).then(()=>{
      console.log("payment:",req.body.paymentMethod)
      if(req.body.paymentMethod === 'cod'){
      res.json({codStatus:true})
      }else if(req.body.paymentMethod === 'razorPay'){
      orderHelpers.generateRazorPay(response.insertedId,response.total).then((response)=>{
      res.json(response)
      })
    }else if(req.body.paymentMethod === 'payPal'){
      orderHelpers.statusPaypal(response.insertedId).then(()=>{
      res.json({paypalStatus:true})
      })
    }
    })
  })
}

const userOrders=async(req,res)=>{
  let cartCount=null
  let user=req.session.user
  if(req.session.user){
   cartCount=await cartHelpers.getCartCount(user._id)
   orderDetails=await orderHelpers.getAllOrders(user._id)
  }
  console.log(orderDetails);
  res.render('user/userOrders',{cartCount,user,orderDetails})
}

const cancelOrder=(req,res)=>{
  
  let id=req.params.id
  
  orderHelpers.cancelOrder(id).then(()=>{
    res.json({status:true})
  })

}

//products-ordered

const productsOrdered=async(req,res)=>{
  let id=req.params.id
  let cartCount=null
  let user=req.session.user
  if(req.session.user){
   cartCount=await cartHelpers.getCartCount(user._id)
   products=await orderHelpers.getOrderedProducts(id)
  }
  console.log(products.length)
  res.render('user/orderedProducts',{cartCount,user,products,admin:false})

}

const orderSuccess=(req,res)=>{
  res.render('user/orderSuccess')
}

const verifyPayment=(req,res)=>{
  console.log('vPay',req.body)
  orderHelpers.verifyPayment(req.body).then(()=>{
    orderHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err)
    res.json({status:false})
  })
}

module.exports={
   landingPage,
   loginPost,
   loginGet,
   signUpGet,
   signUpPost,
   userPanelGet,
   displayProduct,
   catagory,
   otpPhone,
   otpLoginPost,
   otpLoginVerification,
   otpVerifyPost,
   addToCart,
   cart,
   logout,
   cartDelete,
   changeProductQuantity,
   placeOrder,
   addAddress,
   userProfile,
   editProfileGet,
   addAddressPost,
   removeAddress,
   profileAddress,
   editProfilePost,
   profileAddAddressGet,
   profileAddAddressPost,
   profileRemoveAddress,
   placeOrderPost,
   userOrders,
   cancelOrder,
   productsOrdered,
   orderSuccess,
   verifyPayment,
   
}
