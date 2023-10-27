var db=require('../config/connection')
const collection=require('../config/collection')
const { ObjectId } = require('mongodb')
var objectId=require('mongodb').ObjectId


  
module.exports={
    addProduct:(product,pImages)=>{
      return new Promise((resolve,reject)=>{
        product.images=pImages.map(f=>({filename:f.filename}))
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product)
        resolve()
      })
       
  },
    getAllProducts:()=>{
     return new Promise(async(resolve,reject)=>{
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
        resolve(products)
     })
    },
    getProduct:(userId)=>{
      return new Promise(async(resolve,reject)=>{
        let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(userId)})
        resolve(product)
      })
    },
    editProduct:(userId,userData)=>{
      return new Promise(async(resolve,reject)=>{
        let product=await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(userId)},{$set:{
          name:userData.name,
          catagory:userData.catagory,
          stocks:userData.stocks,
          price:userData.price,
          description:userData.description
        }})
        resolve(product.insertedId)
      })
    },
    editProductImage:(proId,Images)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{$set:{
        images:Images.map(f=>({filename:f.filename}))
        }})
        resolve()
      })
    },

    deleteProduct:(userId)=>{
      return new Promise((resolve,reject)=>{
       db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(userId)})
       resolve()
      })
    },
    getProductCatogaryWise:(catagoryId)=>{
      return new Promise(async(resolve,reject)=>{
      let catagory= await db.get().collection(collection.CATAGORY_COLLECTION).findOne({_id:objectId(catagoryId)})
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({catagory:catagory.name}).toArray()
          resolve(products)
        
      })
    },
    getProductsByCatagory:(catagoryName)=>{
      return new Promise(async(resolve,reject)=>{
        let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({catagory:catagoryName})
        if(product==null){
          resolve(product=false)
        }else{
          resolve(product)
        }
      })
    },
    updateProductCatagory:(catagoryName,updation)=>{
      return new Promise(async(resolve,reject)=>{
         let product= await db.get().collection(collection.PRODUCT_COLLECTION).find({catagory:catagoryName}).toArray()
         console.log("product",product)
         console.log("catagoryName",catagoryName)

         if(product){
          db.get().collection(collection.PRODUCT_COLLECTION).updateMany({catagory:catagoryName},{$set:{catagory:updation}}).then(()=>{
            resolve()
          })
         }else{
           resolve()
         }
         
      })
    }
}