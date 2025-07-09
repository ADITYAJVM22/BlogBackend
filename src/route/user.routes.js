import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changePassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAvatar, updateUserDetails } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router()

router.route("/register").post(
    upload.fields([{
        name:"avatar",
        maxCount:1
    }]),
    registerUser
)

router.route("/login").post(loginUser)

//secure routes;only accessed when logged in
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changePassword)
router.route("/curr-User").get(verifyJWT,getCurrentUser)

router.route("/updateDetails").patch(verifyJWT,updateUserDetails)
router.route("/updateAvatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)


export default router