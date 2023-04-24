const express = require('express')
const waController = require('../controllers/waController')

const router = express.Router()



router.get('/', (req, res) => res.status(200).json({ status: "is alive!"}))

router.get('/new', waController.handleNewInstance)

router.get('/qr/:userid', waController.handleQR)

router.post('/message/:userid', waController.handleMessage)

router.get('/logged/:userid', waController.handleUserLogged)

router.get('/userNotFound', waController.handleError)

module.exports = router