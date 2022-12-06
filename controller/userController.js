const userHelpers = require('../helpers/user-Helpers');
var catagoryHelpers = require('../helpers/catagory-Helpers')
var productHelpers = require('../helpers/product-Helpers')
var cartHelpers=require('../helpers/cart-Helpers')
var orderHelpers=require('../helpers/order-helpers');
const { response } = require('../app');
const { ConferenceContext } = require('twilio/lib/rest/insights/v1/conference');
var objectId=require('mongodb').ObjectId

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
          console.log(response)
          res.json({status:true})
        }else{
          res.json({blocked:true})
        }
      })
    } else {
      req.session.userLoginErr = true
      res.json({status:false})
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
    res.json({signed:true})
  })
}

//UserHome
const userPanelGet= async (req, res)=>{
 let user=null
 let cartCount=null
 let wishlist=null
 
 if(req.session.user){
  user=req.session.user
  cartCount=await cartHelpers.getCartCount(user._id)
  wishlist=await cartHelpers.getAllWishlistId(user._id)
 }
  productHelpers.getAllProducts().then((products) => {
    catagoryHelpers.getAllCatagory().then((catagory) => {
      res.render('user/landingPage', { catagory, products ,user,cartCount,wishlist})
    })
  })
}


//Product Display
const displayProduct=async(req, res) => {
  try{
    let user=null
    let cartCount=null
    if(req.session.user){
     user=req.session.user
     cartCount=await cartHelpers.getCartCount(user._id)
    }
    console.log("id",req.params.id)

  userHelpers.getProduct(req.params.id).then((response)=>{
  let product=response
  console.log('products:',product)
    res.render('user/displayProduct', {product,user,cartCount})
  })


  }catch{
    console.log('hellooo')
  }
 
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
  const  phone  =parseInt(req.body.phone) 
  console.log('phone:',req.body.phone)
  // userHelpers.getUserByphno(phone).then((response) => {
  //   const user = response
  //   if (!user) {
  //     req.flash('failed', 'User does not exist')
  //     res.redirect('/otpPhone')
  //   }
    
     
      client.verify
        .services(serverSID)
        .verifications.create({
          to: `+91${phone}`,
          channel: 'sms'
        }).then(data => {
          console.log(data);
          res.json({otpVerify:true})
        })
        .catch(err => {
          console.log('error:',err);
          res.json({otpVerify:false})
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
        res.json({otpErr:true})
      } else {
        res.json({otpValid:true})
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
  res.redirect('/')
}

const cartDelete=(req,res)=>{
  cartHelpers.cartDelete(req.params.id,req.session.user._id).then(()=>{
  res.json({status:true})
  })
}

const changeProductQuantity=(req,res)=>{
  cartHelpers.changeQuantity(req.body).then(async(response)=>{
    cartHelpers.getTotalValue(req.body.user).then((data)=>{

      // response.total=data[0]?.total
      response.total=data[0].total
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
    res.json({status:true})
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
     res.json({status:true})
   })
}

const placeOrderPost=async(req,res)=>{
  let data=req.body
  let userId=req.session.user._id
  data.orderDetails=await userHelpers.getAddress(userId,data.address)
  data.products=await cartHelpers.getAllCartItems(req.session.user._id)
 let order={
  _id:objectId(),
  deliveryDetails:data.orderDetails,
  userId:objectId(userId),
  paymentMethod:data.paymentMethod,
  status:'placed',
  products:data.products,
  total:parseInt(data.totalPrice),
  placedDate:new Date().toDateString()
 }
 req.session.order=order
      //cod
      if(req.body.paymentMethod === 'cod'){
        orderHelpers.addOrder(req.session.user._id,data).then((response)=>{
          cartHelpers.removeAll(req.session.user._id).then(()=>{
      res.json({codStatus:true})
      })
      })

      }else if(req.body.paymentMethod === 'razorPay'){
      orderHelpers.generateRazorPay(order._id,order.total).then((response)=>{
        response.order=order
        console.log('response:',response)
      res.json(response)
      })
    }else if(req.body.paymentMethod === 'payPal'){
      orderHelpers.orderPaypal(order).then(()=>{
      res.json({paypalStatus:true})
      })
    }
  
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
    orderHelpers.addRazorOrder(req.session.order).then(()=>{
      cartHelpers.removeAll(req.session.user._id).then(()=>{
        req.session.order=null
        console.log('working')
          res.json({status:true})  
              })
    })
  }).catch((err)=>{
    console.log(err)
    res.json({status:false})
  })
}

const profileEditAddress=async(req,res)=>{
  let address=null
  let cartCount=null
  let user=req.session.user
  if(req.session.user){
    cartCount=await cartHelpers.getCartCount(user._id)
    address=await userHelpers.getAddress(req.session.user._id,req.params.id)
   }
   console.log('address',address)
    res.render('user/profileEditAddress',{user,address,cartCount})
  }

  const profileEditAddressPost=(req,res)=>{
   userHelpers.editAddress(req.session.user._id,req.params.id,req.body).then(()=>{
    res.redirect('/profileAddress')
   })
  }

  const editAddressPost=(req,res)=>{
    console.log('data:',req.body)
    userHelpers.editAddress(req.session.user._id,req.params.id,req.body).then(()=>{
      res.json({status:true})
    })
  }

  const applyCoupon=(req,res)=>{
    console.log('req:',req.body)
    userHelpers.couponCheck(req.body).then((coupon)=>{
       
       console.log('coupon:',coupon)
      
       if(coupon){
        let cPrice=parseInt(coupon.minPrice)
        let pPrice=parseInt(req.body.price)
        if(cPrice < pPrice || cPrice === pPrice){
          res.json(coupon)
        }else{
          res.json({priceNotValid:true})
        }
       }else{
        res.json({status:false})
       }
    })
  }

  const addToWishlist=(req,res)=>{
    let userId=req.session.user._id
   cartHelpers.addToWishlist(req.params.id,userId).then((response)=>{
    console.log(response);
    res.json(response)
    
   })
  }

  const wishlistGet=async(req,res)=>{
    let user=null
    let wishList=null
    let cartCount=null

    if(req.session.user){
    let userId=req.session.user._id
    user=req.session.user
     wishlist=await cartHelpers.getAllWishlist(userId)
      console.log('wishlist:',wishlist)  
     cartCount=await cartHelpers.getCartCount(userId)
    }

   res.render('user/wishlist',{wishlist,cartCount,user})
  }

  const productSearch=async(req,res)=>{
    console.log(req.query)
    let user=null
    let cartCount=null
    let wishlist=null
    let noResult=null
    let products=null
    try{
       products=await productHelpers.getSearchedProducts(req.query.search)
      if(req.session.user){
        user=req.session.user
        cartCount=await cartHelpers.getCartCount(user._id)
        wishlist=await cartHelpers.getAllWishlistId(user._id)
       }
       res.render('user/searchResult', { products ,user,cartCount,wishlist,noResult})

      console.log('result:',products)
    }catch{
      noResult=true
      res.render('user/searchResult', { products ,user,cartCount,wishlist,noResult})
    }
  }

  const invoice=async(req,res)=>{
   let id=req.params.id
   let cartCount=null
  let user=req.session.user
  if(req.session.user){
   cartCount=await cartHelpers.getCartCount(user._id)
   orderDetails=await orderHelpers.getOrder(id)
  }
  console.log('order:',orderDetails);
  res.render('user/invoice',{cartCount,user,orderDetails})
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
   profileEditAddress,
   profileEditAddressPost,
   editAddressPost,
   applyCoupon,
   addToWishlist,
   wishlistGet,
   productSearch,
   invoice,
}
