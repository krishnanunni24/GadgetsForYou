var db=require('../config/connection')
const collection=require('../config/collection')
const { ObjectId } = require('mongodb')
const { resolveInclude } = require('ejs')
const { response } = require('../app')
var objectId=require('mongodb').ObjectId

module.exports={
    addCatagory:(catagoryData,cImage)=>{
     return new Promise(async(resolve,reject)=>{
        catagoryData.filename=cImage.filename
        console.log(catagoryData.catagoryOffer);
        db.get().collection(collection.CATAGORY_COLLECTION).insertOne(catagoryData)
        resolve()
     })
    },

    getAllCatagory:()=>{
        return new Promise(async(resolve,reject)=>{
           let catagory=await db.get().collection(collection.CATAGORY_COLLECTION).find().toArray()
            resolve(catagory)
        }) 
    },
    
    editCatagory:(ID,catagoryData)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.CATAGORY_COLLECTION).updateOne({_id:objectId(ID)},{$set:{
                name:catagoryData.name,
                catagoryOffer:catagoryData.catagoryOffer
            }})
            resolve()
        })
    },
    editCatagoryImage:(ID,cImage)=>{
    return new Promise(async(resolve,reject)=>{
      db.get().collection(collection.CATAGORY_COLLECTION).updateOne({_id:objectId(ID)},{$set:{filename:cImage.filename}})
    })
    },
    getCatagory:(ID)=>{
     return new Promise(async(resolve,reject)=>{
       let catagory= await db.get().collection(collection.CATAGORY_COLLECTION).findOne({_id:objectId(ID)})
       resolve(catagory)
     })
    },
    deleteCatagory:(ID)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATAGORY_COLLECTION).deleteOne({_id:objectId(ID)})
            resolve()
        })
    },
    getCatagoryOffer:(cat)=>{
        return new Promise(async(resolve,reject)=>{
            console.log('catagoryName:',cat)
           let catagory= await db.get().collection(collection.CATAGORY_COLLECTION).findOne({name:cat})
           console.log('catagory:',catagory)
           resolve(catagory)
        })
    }
}