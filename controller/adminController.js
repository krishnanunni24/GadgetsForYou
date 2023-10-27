
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

const addProductPost = function (req, res) {
    req.body.price=parseInt(req.body.price)
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

const editProductPost = function (req, res) {
    let id = req.params.id
    if(req.files?.length > 0){
        productHelpers.editProductImage(req.params.id,req.files)
    }
    req.body.price=parseInt(req.body.price)
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
    catagoryHelpers.addCatagory(req.body,req.file).then(()=>{
       res.redirect('/admin/catagoryManagement')
    })
    
}

const editCatagoryPost = function (req, res) {

    if(req.file?.filename){
        
     catagoryHelpers.editCatagoryImage(req.params.id,req.file)
    }
    catagoryHelpers.editCatagory(req.params.id, req.body).then(() => {
        console.log(req.params.name)
        productHelpers.updateProductCatagory(req.params.name,req.body.name).then(()=>{
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
    updateOrderStatus
} 