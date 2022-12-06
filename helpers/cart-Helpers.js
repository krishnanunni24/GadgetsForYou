var db=require('../config/connection')
const collection=require('../config/collection')
var objectId=require('mongodb').ObjectId

module.exports={
  addToCart:(productId,userID)=>{
      proObj={
        item:objectId(productId),
        quantity:1
      }
        return new Promise(async(resolve,reject)=>{
         let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userID)})
        if(userCart){
          let proExist=userCart.products.findIndex(product=>product.item==productId)
          if(proExist!=-1){
              db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userID),'products.item':objectId(productId)},
              {
                $inc:{'products.$.quantity':1}
              }).then(()=>{
                resolve()
              })
          }else{
            db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userID)},{
              $push:{products:proObj}
            }).then((response)=>{
              resolve()
            })
          }
        }else{
          let cartObj={
            user:objectId(userID),
            products:[proObj]             
          }
          db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
            resolve()
          })
        }
       
        })
  
      },
      getAllCartItems:(userID)=>{
        return new Promise(async(resolve,reject)=>{
        let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([{
          $match:{user:objectId(userID)}
        },
        {
          $unwind:'$products'
        },{

          $project:{
             item:'$products.item',
             quantity:'$products.quantity'
          }
        },
        { 
            $lookup:{
              from:collection.PRODUCT_COLLECTION,
              localField:'item',
              foreignField:'_id',
              as:'product'
            }          
        },
        {
          $project:{
            item:1,quantity:1,product:{$arrayElemAt:['$product',0]} 
          }
        }
      ]).toArray()
      resolve(cartItems)
        })
       },

       getCartCount:async(userId)=>{
        return new Promise(async(resolve,reject)=>{
          let count=0
          let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
          if(cart){
            count=cart.products.length
          }
          resolve(count)
        })

       },
       
       cartDelete:(proId,userId)=>{
        console.log(userId,'haii',proId) 
        return new Promise(async(resolve,reject)=>{
          let deleted= await db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},{$pull:{products:{item:objectId(proId)}}})
            console.log(deleted)
            resolve()
          
        })
       },
       changeQuantity:(data)=>{
       data.count=parseInt(data.count)
       data.quantity=parseInt(data.quantity)

        return new Promise((resolve,reject)=>{
          if(data.count==-1 && data.quantity== 1){
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(data.cart)},{$pull:{products:{item:objectId(data.product)}}}).then((response)=>{
               resolve({removeProduct:true})
            })
          }else{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(data.cart),'products.item':objectId(data.product)},
            {
              $inc:{'products.$.quantity':data.count}
            }).then((response)=>{
              resolve({status:true})
            })
          }  
        })
       },

       getTotalValue:(userId)=>{
        return new Promise(async(resolve,reject)=>{
          let totalPrice=await db.get().collection(collection.CART_COLLECTION).aggregate([{
            $match:{user:objectId(userId)}
          },
          {
            $unwind:'$products'
           } ,{
  
             $project:{
             item:'$products.item',
             quantity:'$products.quantity'
          }
         },
          { 
              $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'product'
              }          
          },
          {
            $project:{
              item:1,quantity:1,product:{$arrayElemAt:['$product',0]} 
            }
          },
          {
            $group:{
              _id:null,
              total:{$sum:{$multiply:['$quantity','$product.finalPrice']}}
            }
          }
        ]).toArray()
        resolve(totalPrice)
          })
       },

       removeAll:(userId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(userId)}).then(()=>{
            resolve()
          })
        })
       },

      
       addToWishlist:(proId,userId)=>{
        proObj={
          item:objectId(proId),
        }
         return new Promise(async(resolve,reject)=>{
          let wishList=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
          if(wishList){
            let proExist=wishList.products.findIndex(product=>product.item==proId)
            if(proExist!=-1){
                db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},{$pull:{products:{item:objectId(proId)}}}).then(()=>{
                  resolve({deleted:true})
                })
            }else{
              db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},{
                $push:{products:proObj}
              }).then(()=>{
                resolve({added:true})
              })
            }
          }else{
            console.log('helloo')
            let wishListObj={
              user:objectId(userId),
              products:[proObj]             
            }
            db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishListObj).then(()=>{
              resolve({added:true})
            })
          }
         })
       },

       getAllWishlist:(userId)=>{
       return new Promise(async(resolve,reject)=>{
       let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
          {
            $match:{user:objectId(userId)}
          },
          {
            $unwind:'$products'
          },
          {
            $project:{
              item:'$products.item',
           }
          },
          {
            $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'product'
            }
          },
          {
            $project:{
              item:1,product:{$arrayElemAt:['$product',0]} 
            }
          }
        ]).toArray()
        resolve(wishlist)
       })
       },

       getAllWishlistId:(userId)=>{
        return new Promise(async(resolve,reject)=>{
          let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
             {
               $match:{user:objectId(userId)}
             },
             {
               $unwind:'$products'
             },
             {
               $project:{
                 item:'$products.item',
              }
             }
             
           ]).toArray()
           resolve(wishlist)
          })
       }



}