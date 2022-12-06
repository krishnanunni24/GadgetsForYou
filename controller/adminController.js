
var productHelpers = require('../helpers/product-Helpers');
const catagoryHelpers = require('../helpers/catagory-Helpers');
const userHelpers = require('../helpers/user-Helpers');
const orderHelpers = require('../helpers/order-helpers');
const { adminGetAllOrders } = require('../helpers/order-helpers');



// Admin Login
const loginPage = (req, res, next) => {
    if (req.session.adminLogInErr) {
        res.render('admin/adminLogin', { 'loggInErr': req.session.adminLogInErr });
    } else {
        req.session.adminLogInErr = false;
        res.render('admin/adminLogin', { 'loggInErr': req.session.adminLogInErr });
    }
}

const loginPost = (req, res, next) => {
    const admin = 'admin@gmail.com'
    const password = '123456'
    if (req.body.username === admin && req.body.password === password) {
        req.session.adminLoggedIn = true
        res.redirect('admin/adminDashboard');
    } else {
        req.session.adminLoggedIn = false
        req.session.adminLogInErr = true
        res.redirect('/admin')
    }
}

// Admin Dashboard
const adminDashboard = async(req, res) => {
    if (req.session.adminLoggedIn) {
       let totalProducts= await productHelpers.getAllProducts()
       totalProducts=totalProducts.length
       console.log('products',totalProducts);
       let customers=await userHelpers.getAllUsers()
       customers= customers.length
       console.log('users',customers);
       let orders= await orderHelpers.adminGetAllOrders()
       orders=orders.length
       console.log('orders',orders)

        res.render('admin/dashBoard',{totalProducts ,customers ,orders})
    }
}

// User Management
const userManagement = (req, res) => {
    userHelpers.getAllUsers().then((users) => {
        res.render('admin/userManagement', { users })
    })
}

// Product Management
const productManagement = (req, res) => {
    productHelpers.getAllProducts().then((products) => {
        for(var k=0;k<products.length;k++){
            for(var i=0;i<products[k].images.length;i++){
               console.log(products[k].images[i].filename)
            }
        }
        res.render('admin/productManagement', { products })
    })
}

// Adding Product
const addProductGet = function (req, res) {
    catagoryHelpers.getAllCatagory().then((catagory) => {
        res.render('admin/addProduct', { catagory })
    })
}

const addProductPost = async(req, res)=>{
    console.log('files:',req.files)

   req.body.price=parseInt(req.body.price)
   req.body.offer=parseInt(req.body.offer)
  let catagory=await catagoryHelpers.getCatagoryOffer(req.body.catagory)
  if(isNaN(catagory.catagoryOffer)){
  req.body.catagoryOffer=0
  console.log('req.body.catagoryOffer:',req.body.catagoryOffer)
  }else{
  req.body.catagoryOffer=catagory.catagoryOffer
  }
  if(req.body.offer === NaN){
    req.body.offer=0
    }

    
  console.log('body:',req.body)
  console.log('req.body.offer:',req.body.offer)



   
   let pri= req.body.price
   let off=req.body.offer
   let catOff=req.body.catagoryOffer
   console.log(typeof off)
   console.log(typeof catOff)

    if(off > 0 && off > catOff){
        req.body.finalPrice= pri-(pri*off/100)
        console.log('product offer aplied:',req.body.finalPrice)
    }else if(catOff > 0 &&  catOff > off){
        req.body.finalPrice= pri-(pri*catOff/100)
        console.log('catagory offer aplied:',req.body.finalPrice)
    }
    else if(catOff === off){
        req.body.finalPrice= pri-(pri*off/100)

    }else{
        req.body.finalPrice = pri
        console.log('no offer')
    }
    
    console.log('final price:',req.body.finalPrice)

    productHelpers.addProduct(req.body,req.files).then(()=>{
        res.redirect('/admin/productManagement')
    })
   
}

// Admin logout
const logout = function (req, res) {
    req.session.destroy()
    res.redirect('/admin')
}

//Block & Unblock User
const blockUser = function (req, res) {
    userHelpers.blockUsers(req.params.id, req.body.value).then(() => {
        req.session.userBlocked = true
        res.redirect('/admin/userManagement')
    })
}

const unBlockUser = function (req, res) {
    userHelpers.unBlockUsers(req.params.id, req.body.value).then(() => {
        req.session.userBlocked = false
        res.redirect('/admin/userManagement')
    })
}

//Edit Product
const editProductGet = function (req, res) {
    productHelpers.getProduct(req.params.id).then((product) => {
        console.log(product)
        catagoryHelpers.getAllCatagory().then((catagory) => {
            res.render('admin/editProduct', { product, catagory })
        })
    })
}

const editProductPost = async(req, res)=>{
    let id = req.params.id
    console.log('req.files:',req.files)
    console.log('req.body',req.body)

    // if(req.files?.length > 0){
        if(req.file.filename){
        productHelpers.editProductImage(req.params.id,req.files)
    }
   req.body.price=parseInt(req.body.price)
   req.body.offer=parseInt(req.body.offer)

   let catagory=await catagoryHelpers.getCatagoryOffer(req.body.catagory)
   if(isNaN(catagory.catagoryOffer)){
   req.body.catagoryOffer=0
   console.log('req.body.catagoryOffer:',req.body.catagoryOffer)
   }else{
   req.body.catagoryOffer=catagory.catagoryOffer
   }
   if(isNaN(req.body.offer)){
     req.body.offer=0
     }
 
     
   console.log('body:',req.body)
   console.log('req.body.offer:',req.body.offer)
 
 
 
    
    let pri= req.body.price
    let off=req.body.offer
    let catOff=req.body.catagoryOffer
    console.log(typeof off)
    console.log(typeof catOff)
 
     if(off > 0 && off > catOff){
         req.body.finalPrice= pri-(pri*off/100)
         console.log('product offer aplied:',req.body.finalPrice)
     }else if(catOff > 0 &&  catOff > off){
         req.body.finalPrice= pri-(pri*catOff/100)
         console.log('catagory offer aplied:',req.body.finalPrice)
     }
     else if(catOff === off){
         req.body.finalPrice= pri-(pri*off/100)
 
     }else{
         req.body.finalPrice = pri
         console.log('no offer')
     }
     
     
     console.log('final price:',req.body.finalPrice)
 
     
    productHelpers.editProduct(req.params.id, req.body).then(() => {
        res.redirect('/admin/productManagement')
        if (req.files) {
            console.log('file incoming')
        
        }
    })
}

//Delete Product
const deleteProduct = function (req, res) {
    productHelpers.deleteProduct(req.params.id).then(() => {
        req.flash('success','Product deleted')
        res.json({status:true})
    })
}

//Catagory Management

const catagoryManagement = function (req, res) {
    catagoryHelpers.getAllCatagory().then((catagory) => {
        res.render('admin/catagoryManagement', { catagory ,"deleteErr":req.session.catagoryNotEmpty})
        req.session.catagoryNotEmpty=false
    })

}

const addCatagoryGet = function (req, res) {
    res.render('admin/addCatagory')
}

const addCatagoryPost = function (req, res) {
    console.log(req.body)
    req.body.catagoryOffer=parseInt(req.body.catagoryOffer)
    catagoryHelpers.addCatagory(req.body,req.file).then(()=>{
       res.redirect('/admin/catagoryManagement')
    })
    
}

const editCatagoryPost = function (req, res) {

    // if(req.file?.filename){
        if(req.file.filename){   
     catagoryHelpers.editCatagoryImage(req.params.id,req.file)
     }
    req.body.catagoryOffer=parseInt(req.body.catagoryOffer)
    if(isNaN(req.body.catagoryOffer)){
        req.body.catagoryOffer=0
    }
    catagoryHelpers.editCatagory(req.params.id, req.body).then(() => {
        console.log(req.params.name)
        productHelpers.updateProductCatagory(req.params.name,req.body.name,req.body.catagoryOffer).then(()=>{
            res.redirect('/admin/catagoryManagement')
        })
    })
}

const editCatagoryGet = function (req, res) {
    catagoryHelpers.getCatagory(req.params.id).then((catagory) => {
        res.render('admin/editCatagory', { catagory })
    })
}


const deleteCatagory = function (req, res) {
    catagoryHelpers.getCatagory(req.params.id).then((catagory) => {
        productHelpers.getProductsByCatagory(catagory.name).then((products) => {
            if (products===false) {
                req.flash('success','catagory deleted')
                catagoryHelpers.deleteCatagory(req.params.id).then(() => {
                    res.json({status:true})
                })
            } else {
                req.session.catagoryNotEmpty=true
                req.flash('failed','Catagory not empty,Clear Products to delete Catagory')
                res.json({status:false})
            }
        })
    })

}

const orderManagement=async(req,res)=>{
      
   orderHelpers.adminGetAllOrders().then((orderDetails)=>{
    res.render("admin/orderManagement",{orderDetails})
   })
}

const adminCancelOrder=async(req,res)=>{
    orderHelpers.adminCancelOrder(req.params.id).then(()=>{
        res.redirect('/admin/orderManagement')
    })
}

const productsOrdered=async(req,res)=>{
    let id=req.params.id 
    let products=null
    let user=null


    products= await orderHelpers.getOrderedProducts(id)
    user=await userHelpers.adminGetUser(products[0].userId)



    res.render('user/orderedProducts',{products,admin:true,user})
  
  }

  const updateOrderStatus=async(req,res)=>{
  
    let id=req.params.id
    orderHelpers.updateOrderStatus(id,req.body.status).then(()=>{
      res.redirect('/admin/orderManagement')
    })

  }

  const couponManagement=async(req,res)=>{
  let coupons=await userHelpers.getAllCoupons()

    res.render('admin/couponManagement',{coupons})
  }

  const addCouponForm=(req,res)=>{
   console.log('body:',req.body)
   userHelpers.addCoupon(req.body).then(()=>{
    res.json({status:true})
   })

  }

  const editCouponForm=(req,res)=>{
   userHelpers.editCoupon(req.params.id,req.body).then(()=>{
    res.json({status:true})
   })
  }

  const deleteCoupon=(req,res)=>{
    userHelpers.deleteCoupon(req.params.id).then(()=>{
        res.json({status:true})
    })
  }

module.exports = {
    loginPage,
    loginPost,
    adminDashboard,
    userManagement,
    productManagement,
    addProductGet,
    addProductPost,
    logout,
    blockUser,
    unBlockUser,
    editProductGet,
    editProductPost,
    deleteProduct,
    catagoryManagement,
    addCatagoryGet,
    addCatagoryPost,
    editCatagoryPost,
    editCatagoryGet,
    deleteCatagory,
    orderManagement,
    adminCancelOrder,
    productsOrdered,
    updateOrderStatus,
    couponManagement,
    addCouponForm,
    editCouponForm,
    deleteCoupon
} 