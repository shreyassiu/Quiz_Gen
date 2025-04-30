const router = require("express").Router();
const {signupValidation,loginValidation} = require('../Middlewares/Validation')
const {signup,login} = require('../Controllers/AuthController.js')

router.post('/',(req,res)=>{
    res.send('Auth route')
})
router.post('/signup',signupValidation,signup)

router.post('/login',loginValidation,login)


module.exports = router