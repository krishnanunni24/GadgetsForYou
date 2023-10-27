var express = require('express');
var router = express.Router();
var user=require('../controller/userController')


router.get('/',user.landingPage);

router.get('/login',user.loginGet);

router.post('/login',user.loginPost);

router.get('/signup',user.signUpGet)

router.post('/signup', user.signUpPost)

router.get("/userPanel", user.userPanelGet)

router.get("/displayProduct/:id",user.displayProduct)

router.get('/catagory/:id',user.catagory)

router.get('/otpPhone',user.otpPhone)

router.post('/otpLogin',user.otpLoginPost);

router.get('/otpLogin/verification',user.otpLoginVerification);

router.post('/otpVerify',user.otpVerifyPost)

router.get('/addToCart/:id',user.addToCart)

router.get('/cart',user.cart)

router.get('/logout',user.logout)

router.get('/cartDelete/:id',user.cartDelete)

router.post('/changeProductQuantity',user.changeProductQuantity)

router.get('/placeOrder',user.placeOrder)

router.post('/placeOrderPost',user.placeOrderPost)

router.get('/orderSuccess',user.orderSuccess)

router.get('/addAddress',user.addAddress)

router.get('/userProfile',user.userProfile)

router.get('/editProfileGet',user.editProfileGet)

router.post('/editProfilePost',user.editProfilePost)

router.post('/addAddressPost',user.addAddressPost)

router.get('/removeAddress/:id',user.removeAddress)

router.get('/profileAddress',user.profileAddress)

router.get('/profileAddAddress',user.profileAddAddressGet)

router.post('/profileAddAddressPost',user.profileAddAddressPost)

router.get('/profileRemoveAddress/:id',user.profileRemoveAddress)

router.get('/userOrders',user.userOrders)

router.get('/cancelOrder/:id',user.cancelOrder)

router.get('/productsOrdered/:id',user.productsOrdered)

router.post('/verifyPayment',user.verifyPayment)


























module.exports = router;
