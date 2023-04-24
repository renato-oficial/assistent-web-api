const express = require('express')
const app = express()
const waRoutes = require('../routes/waRoutes')
const Database = require('../controllers/database/dbConnection')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/wa/qr/:userid', async (req, res, next) => {
  	const { userid } = req.params
  		const database = new Database()
  		const user = await database.findUser(userid)
  		if(!user) return res.redirect("wa/userNotFound")
  		next()
});


app.set('view engine', 'ejs')
app.use('/wa', waRoutes)


module.exports = {
	start : () => {
		app.listen(process.env.PORT || 3000, () => {
			console.log('Server started on port 3000')
		})
	}
}