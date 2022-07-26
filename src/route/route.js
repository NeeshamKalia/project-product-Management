const express = require('express')
const router = express.Router()

const {createUser, loginUser, getUserById, updateUserProfile} = require('../controllers/userController')
const {checkAuth, authrz} = require('../middleware/auth')

router.post("/register",  createUser);
router.post("/login", loginUser)
router.get("/user/:userId/profile", checkAuth, authrz, getUserById)
router.put("/user/:userId/profile", checkAuth, authrz, updateUserProfile)


 


router.all("/****", function (req, res) {
    res.status(404).send({
        status: false,
        message: "please enter the valid URL"
    })
})


module.exports = router