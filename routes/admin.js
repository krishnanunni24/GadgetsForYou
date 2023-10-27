var express = require('express');
var router = express.Router();
var admin=require('../controller/adminController');
const {uuid}=require('uuidv4')
const {getchartData}=require('../helpers/user-Helpers')
//multer
const multer=require('multer')
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'public/uploads/')
    },
    filename:function(req,file,cb){
        cb(null,uuid()+'.png')
    }
});

const upload=multer({
    storage:storage,
    fileFilter:(req,file,cb)=>{
        if(
        file.mimetype == 'image/png' ||
        file.mimetype == 'image/jpg' ||
        file.mimetype == 'image/jpeg'||
        file.mimetype ==  'image/webp'
     ){
        cb(null,true)
     }else{
        cb(null,false);
        return cb(new Error('Only .png .jpg and .jpeg format allowed'))
     }
    }
})


/* GET home page. */

router.get('/',admin.loginPage);

router.post('/',admin.loginPost);

router.get('/adminDashboard',admin.adminDashboard)

router.get('/userManagement',admin.userManagement)

router.get('/productManagement',admin.productManagement)

router.get('/addProduct',admin.addProductGet)

router.post('/addProduct',upload.array('image',4),admin.addProductPost)

router.get('/logout',admin.logout)

router.post('/block/:id',admin.blockUser)

router.post('/unblock/:id',admin.unBlockUser)

router.get('/editProduct/:id',admin.editProductGet)

router.post('/editProduct/:id',upload.array('image',4),admin.editProductPost)

router.get('/deleteProduct/:id',admin.deleteProduct)

router.get('/catagoryManagement',admin.catagoryManagement)

router.get('/addCatagory',admin.addCatagoryGet)

 router.post('/addCatagory',upload.single('image'),admin.addCatagoryPost)
  
 router.post('/editCatagory/:id/:name',upload.single('image'),admin.editCatagoryPost)

 router.get('/editCatagory/:id',admin.editCatagoryGet)

 router.get('/deleteCatagory/:id',admin.deleteCatagory)

 router.get('/orderManagement',admin.orderManagement)

 router.get('/adminCancelOrder/:id',admin.adminCancelOrder)

router.get('/productsOrdered/:id',admin.productsOrdered)

router.post('/updateOrderStatus/:id',admin.updateOrderStatus)

router.get('/getChartData',getchartData)













module.exports = router;
