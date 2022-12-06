var db=require('../config/connection')
const collection=require('../config/collection')
const bcrypt=require('bcrypt')
const { response } = require('../app')
var objectId=require('mongodb').ObjectId


module.exports={
    addUser:(userData)=>{
     console.log(userData)
     return new Promise(async(resolve,reject)=>{
       userData.password=await bcrypt.hash(userData.password,10) 
       userData.loginAccess='unblocked'
       console.log(userData.password)   
       db.get().collection(collection.USER_COLLECTION).insertOne(userData)
       resolve()
     })
    },

    getUser:(userId)=>{
      return new Promise(async(resolve,reject)=>{
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
        resolve(user)
      })
    },

     adminGetUser:(userId)=>{
      return new Promise(async(resolve,reject)=>{
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:userId})
        resolve(user)
      })
    },


    getProduct:(proId)=>{
      return new Promise(async(resolve,reject)=>{
        let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((data)=>{
          resolve(data)
        }).catch(()=>{
          reject()
        })
      })
    },
    
    getAllUsers:()=>{
     return new Promise(async(resolve,reject)=>{
        let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
        resolve(users)
     })
    },
    blockUsers:(userId,userData)=>{
        return new Promise(async(resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{loginAccess:'blocked'}})
        console.log('blocked')
       resolve()
        })
    },
  unBlockUsers:(userId,userData)=>{
      return new Promise(async(resolve,reject)=>{
      db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{loginAccess:'unblocked'}})
      console.log('unblocked')
     resolve()
      })
    },
    doLogin:(loginData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
          let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:loginData.email})
          if(user){
            bcrypt.compare(loginData.password,user.password).then((status)=>{
            if(status){
                 response.userData=user
                 response.status=true
                 resolve(response)
            }else{
                console.log('Loggin failed')
                resolve({status:false})
            }
            })
          }else{
            resolve({status:false})
          }
        })

    },
    blockCheck:(userEmail)=>{
      return new Promise(async(resolve,reject)=>{
        let response={}
        let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userEmail})
        if(user.loginAccess==='unblocked'){
          console.log('logged in successfully')
          response.status=true
          resolve(response)
        }else{
          response.status=false
          resolve(response)
        }
      })
    },
    getUserByphno:(phone)=>{
      return new Promise(async(resolve,reject)=>{
        let Phone= await db.get().collection(collection.USER_COLLECTION).findOne({phone:phone})
        console.log(Phone)
        resolve(Phone)
      })
    },

    addAddress:(address,userId)=>{
      return new Promise(async(resolve,reject)=>{
        console.log(address)
       addrObj={
        id:objectId(),
        name:address.name,
        pincode:address.pincode,
        address:address.address,
        town:address.town,
        city:address.city,
        phone:address.phone,
        state:address.State
       }   

      let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
      console.log(userId);
       if(user.address?.length > 0){
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$push:{address:addrObj}}).then(()=>{
          resolve()
        })
       }else{
        console.log('else case')
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{address:[addrObj]}}).then(()=>{
          resolve()
        })
       }
      })
    },

    editAddress:(userId,addId,data)=>{
      return new Promise((resolve,reject)=>{
       db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId),'address.id':objectId(addId)},{$set:{
        'address.$.name':data.name,
        'address.$.pincode':data.pincode,
        'address.$.address':data.address,
        'address.$.town':data.town,
        'address.$.city':data.city,
        'address.$.phone':data.phone,
        'address.$.state':data.State 
      }})
      resolve()
      
      })
    },

    getAlladdress:(userId)=>{
      return new Promise (async(resolve,reject)=>{
       let response=await db.get().collection(collection.USER_COLLECTION).aggregate([
      {
        $match:{_id:objectId(userId)}
      },
      {
        $unwind:'$address'
      },
      {
        $project:{
          address:'$address'
        }
      }
      ]).toArray()
      resolve(response)

      })
    },

    removeAddress:(userId,addressID)=>{
      return new Promise(async(resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$pull:{address:{id:objectId(addressID)}}}).then(()=>{
          resolve()
        })
      })
    },

    editProfile:(userId,data)=>{
      return new Promise((resolve,reject)=>{
       db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{
        username:data.name,
        email:data.email,
        phone:data.phone
       }}).then(()=>{
        resolve()
       })
      })
    },

    getAddress:(userId,addId)=>{
      return new Promise(async(resolve,reject)=>{
       let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
       let n=user.address.findIndex(address=>address.id==addId)
       resolve(user.address[n])

      })
    },

    getchartData: (req, res) =>
     {
      console.log('hoooy')
        db.get().collection(collection.ORDER_COLLECTION).aggregate([
          { $match: { "status": "delivered" } },
          {
            $project: {
              date: { $convert: { input: "$_id", to: "date" } }, total: "$total"
            }
          },
          {
            $match: {
              date: {
                $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 365))
              }
            }
          },
          {
            $group: {
              _id: { $month: "$date" },
              total: { $sum: "$total" }
            }
          },
          {
            $project: {
              month: "$_id",
              total: "$total",
              _id: 0
            }
          }
        ]).toArray().then(result => {
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
            { $match: { "status": "delivered" } },
            {
              $project: {
                date: { $convert: { input: "$_id", to: "date" } }, total: "$total"
              }
            },
            {
              $match: {
                date: {
                  $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 7))
                }
              }
            },
            {
              $group: {
                _id: { $dayOfWeek: "$date" },
                total: { $sum: "$total" }
              }
            },
            {
              $project: {
                date: "$_id",
                total: "$total",
                _id: 0
              }
            },
            {
              $sort: { date: 1 }
            }
          ]).toArray().then(weeklyReport => 
            {
            console.log(weeklyReport,"ggggggggggggggggggggggggg")
            res.status(200).json({ data: result, weeklyReport })
            console.log(result)
          })
        })
      },

      getAllCoupons:()=>{
        return new Promise(async(resolve,reject)=>{
          let result=await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
          resolve(result)
        })
      },
      addCoupon:(data)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.COUPON_COLLECTION).insertOne(data)
          resolve()
        })
      },
      editCoupon:(couId,data)=>{
       return new Promise((resolve,reject)=>{
        db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:objectId(couId)},{$set:{
          couponCode:data.couponCode,
          price:data.price,
          validFrom:data.validFrom,
          validTill:data.validTill,
          minPrice:data.minPrice
        }})
        resolve()
       })
      },
      
      deleteCoupon:(couId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(couId)})
          resolve()
        })
      },

      couponCheck:(code)=>{
        return new Promise(async(resolve,reject)=>{
          console.log(code);
        let coupon=await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode:code.couponCode})
         
        resolve(coupon)
        })
      }

   
}    