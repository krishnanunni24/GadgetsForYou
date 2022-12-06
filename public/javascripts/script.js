const { response } = require("../../app");



function addToCart(proId){
    $.ajax({
        url:'/addToCart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cartCount').html()
                count=parseInt(count)+1
                $('#cartCount').html(count)

            }
        }
    })

}

function changeQuantity(cartId,proId,count){
    console.log('hiiii')
    $.ajax({
      url:'/changeProductQuantity',
      data:{
        cart:cartId,
        product:proId,
        count:count
      },
      method:'post',
      success:(response)=>{
        alert(response)
      }
    })
}