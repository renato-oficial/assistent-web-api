var Datastore = require('nedb')


class Database {
	constructor(){
		if(!Database.instance){
			Database.instance = this
			this.db = new Datastore({ filename: 'users.db', autoload: true });
		}
		return Database.instance
	}


	async findUser(userid){
		return new Promise(( resolve, reject ) => {
			// The same rules apply when you want to only find one document
			this.db.findOne({ userid }, function (err, doc) {
			  if(err) reject(err)
			  if(doc) resolve(doc)
			});
		})
	}

	async insertUser(User){
		return new Promise((resolve, reject) => {
			this.db.insert(User, function (err, newDoc) {   // Callback is optional
				if(err) reject(err)
  				if(newDoc) resolve(newDoc)
			});
		})
	}
}

module.exports = Database