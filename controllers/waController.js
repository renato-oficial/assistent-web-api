const WAConnection = require('../models/WAConnection')
const path = require('path')
const qrCode = require('qrcode')
const { v4: uuidv4} = require('uuid')
const Database = require('./database/dbConnection')



exports.handleError = async (req, res ) => {
	try{
		
		res.status(401).json({message: 'User not found!'})

	}catch (error){
		console.log(error)
	}
}

exports.handleUserLogged = async (req, res) => {

	try{

		let out = 0
		if(out < 1){
			const { userid } = req.params
			res.status(200).send(`Usuário com o id: ${userid} já está logado!`)
			out++
		}
		

	}catch (error){
		console.log(error)
	}
}

exports.handleQR = async (req, res) => {
	try{
		let out = 0
		const { userid } = req.params
		console.log(userid)

		const waConnection = new WAConnection({ userid })
	 	await waConnection.initialize()
	 	/*waConnection.on('qr', async (qr)  => {
	 		const codeUrl = await qrCode.toDataURL(qr)
	 		res.render(path.join(__dirname, '..', 'views', 'index.ejs'),{ 
				code: codeUrl 
			})	
	 		
	 	})
		*/

	 	waConnection.on('logged', (id) => {
	 		if(out < 1){
	 			return res.redirect(`/wa/logged/${id}`)
	 		}

	 	})

	} catch (error){
		
		console.log(error)
		//res.status(500).json({ error: "Failed to connect to WAConnection"})

	}
}

exports.handleNewInstance = async (req, res) => {
	try{

		const userid = uuidv4()
		const User = { userid, createdAt: new Date() }

		if(userid){
			const database = new Database()
			const user = await database.insertUser(User) 
			if(user) return res.status(200).json({ userid })
		}
		
	}catch (error){
		console.log(error)
		res.status(500).json({ error: 'Failed create new WA instance'})
	}
}
exports.handleMessage = async (req, res) => {

	try{

		const { from, text } = req.body
		const { userid } = req.params
		const waConnection = new WAConnection({ userid })
		await waConnection.typeMessage({ from, text})
		res.json({ sucess: true })

	} catch (error){

		console.log(error)
		res.status(500).json({ error: 'Failed to send message'})

	}
}