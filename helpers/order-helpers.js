var db=require('../config/connection')
const collection=require('../config/collection')
const { ORDER_COLLECTION } = require('../config/collection')
const { resolveInclude } = require('ejs')
var objectId=require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { resolve } = require('path')

//razorPay 
var instance = new Razorpay({
    key_id: 'rzp_test_GrQRKdSRhoZnCr',
    key_secret: 'fQzX5QH0nP5hNtRvegnHSMjR',
  }); 


module.exports={
  
   addOrder:(userId,data)=>{
    
    let status=data.paymentMethod==='cod'?'placed':'pending';

    orderObj={
        deliveryDetails:data.orderDetails,
        userId:objectId(userId),
        paymentMethod:data.paymentMethod,
        status:status,
        products:data.products,
        total:parseInt(data.totalPrice) ,
        placedDate:new Date().toDateString()
    }   
    console.log('Placed date:',orderObj.placedDate)
    return new Promise(async(resolve,reject)=>{
     db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then(async(response)=>{
        let order=await db.get().collection(collection.ORDER_COLLECTION).findOne(response.insertedId)
        response.total=order.total
         resolve(response)
      })
    })
   },

   getAllOrders:(userId)=>{
    
    return new Promise(async(resolve,reject)=>{  
     let response= await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
     resolve(response)
    })

   },

   cancelOrder:(orderId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{$set:{status:'Cancelled'}}).then(()=>{
            resolve()
        })

    })
   },

   adminCancelOrder:(orderId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{$set:{status:'Cancelled by Admin'}}).then(()=>{
            resolve()
        })
    })
   },

   adminGetAllOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let response=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
        resolve(response)
    })

   },

   getOrderedProducts:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let products=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $match:{_id:objectId(orderId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:
                {
                 userId:'$userId',
                 quantity:'$products.quantity',
                 product:'$products.product',
                 total:'$total',
                 
                }
            }
    ]).toArray()
    console.log(products)
    resolve(products)
    })

   },
   updateOrderStatus:(orderId,status)=>{
    return new Promise((resolve,reject)=>{
    
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{$set:{status:status}}).then(()=>{
            resolve()
        })
    })
   },

   generateRazorPay:(orderId,total)=>{
     return new Promise((resolve,reject)=>{
        total=parseInt(total)
        orderId=orderId.toString()
        var options = {
            amount: total*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: orderId
          };
          instance.orders.create(options, function(err, order) {
            if(err){
                console.log(err)
            }else{
                console.log('New order:',order);
                resolve(order)
            }
          });
     })
   },

   verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
     const crypto = require('crypto')
     let hmac = crypto.createHmac('sha256','fQzX5QH0nP5hNtRvegnHSMjR')

     hmac.update(details['payment[razorpay_order_id]']+'|'+ details['payment[razorpay_payment_id]'] )
     hmac=hmac.digest('hex')
     if(hmac == details['payment[razorpay_signature]']){
        resolve()
     }else{
        reject()
     }
    })
   },
   changePaymentStatus:(orderId)=>{
    return new Promise((resolve,reject)=>{

        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{$set:{status:'placed'}}).then(()=>{
            resolve()
        })
    })
   },
   addRazorOrder:(data)=>{
    return new Promise((resolve,reject)=>{
        console.log('B order:',data)
        data._id=objectId(data._id)
        data.userId=objectId(data.userId)
        db.get().collection(collection.ORDER_COLLECTION).insertOne(data).then(()=>{
            console.log('A order:',data)
            resolve()
        })
    })
   },
   getOrder:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
       let response= await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
            resolve(response)
    })
   },

   orderPaypal:(order)=>{
    return new Promise((resolve,reject)=>{
    db.get().collection(collection.ORDER_COLLECTION).insertOne(order).then(()=>{
        resolve()
    })
    })
   }



}