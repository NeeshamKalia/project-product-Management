const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const auth = require('../middleware/auth')

router.post("/register",  userController.createUser);
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile", auth.checkAuth, auth.authrz, userController.getUserById)
router.put("/user/:userId/profile", auth.checkAuth, auth.authrz, userController.updateUserProfile)


 


router.all("/****", function (req, res) {
    res.status(404).send({
        status: false,
        message: "please enter the valid URL"
    })
})


module.exports = router