const mongoClient =require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=function(done){
    const url='mongodb+srv://krishnanunni:catchmeifucan@cluster1.6hhjfqi.mongodb.net/test'
    const dbname='ecommerce'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()

    })
}
module.exports.get=function(){
    return state.db 
}