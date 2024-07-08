// by using promises
const asyncHandler = (requestHandler) => {
   return (req,res,next) => 
         {
             Promise.resolve(requestHandler(req,res,next)).
             catch((err)=>next(err))
         }
}

export {asyncHandler}




/*
//this is higher order function
//higher order function can take function as parameter
const asyncHandler = (func)=>async(req,res,next)=>{
    try {
        await func(req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}
    */