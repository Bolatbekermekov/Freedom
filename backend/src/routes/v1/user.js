import express from 'express'

import {
	changePassword,
	deleteUser,
	forgetpassword,
	getMyProfile,
	logOut,
	login,
	resetpassword,
	signup,
	submitMessage,
	updatePic,
	updateProfile,
} from '../../controllers/v1/user.js'
import { isAuthenticated } from '../../middlewares/auth.js'
import { singleUpload } from '../../middlewares/multer.js'

const router = express.Router()

router.post('/login', login)
router.post('/submitmessage', submitMessage)

router.post('/new', singleUpload, signup)
router.post('/delete', isAuthenticated, deleteUser)

router.get('/me', isAuthenticated, getMyProfile)
router.get('/logout', isAuthenticated, logOut)

// Updating Routes
router.put('/updateprofile', isAuthenticated, updateProfile)
router.put('/changepassword', isAuthenticated, changePassword)
router.put('/updatepic', isAuthenticated, singleUpload, updatePic)

// Forget Password & Reset Password
router.route('/forgetpassword').post(forgetpassword).put(resetpassword)

export default router
