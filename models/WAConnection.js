const {default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore } = require('@adiwajshing/baileys')
const EventEmitter = require('events');
var qrcode = require('qrcode-terminal');
//const onMessage = require("./onMessage")
const path = require('path')
const P = require("pino")
const fs = require('fs')

const users = {}

class WAConnection extends EventEmitter {
	
	
	constructor(){
		super()

		if(!WAConnection.instance){
			WAConnection.instance = this
			this.client = {}
			this.qrRetry = 0	
			
		}

		return WAConnection.instance
	}

	
	async initialize({ client }){

		const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '..', client.id))
		const { version, isLatest } = await fetchLatestBaileysVersion()
		Object.assign(client, { status: 'initializing'})

		this.socket =  makeWASocket({
		    version,
		    // can provide additional config here
		    printQRInTerminal: false,
		    auth: state ,
		    msgRetryCounterMap: {},
		    logger:  P({ level: 'silent' })

		})
		
	
		const store = makeInMemoryStore({ })

		try{
			store.readFromFile(path.join(__dirname, '..', client.id, 'store.json'))
		} catch(e){
			fs.rmdirSync(path.join(__dirname, '..', client.id, 'store.json'))
		}

		setInterval(() => {
			try{
				store.writeToFile(path.join(__dirname, '..', client.id, 'store.json'))
			} catch (e) {}
		}, 10000)


		client = users[client.id] = Object.assign(this.socket, { ...client, store: store})

		store.bind(this.socket.ev)

		this.socket.ev.on ('creds.update', saveCreds)

		this.socket.ev.on('connection.update', (update) => {


		    const { connection, lastDisconnect, qr} = update 
		    if(connection === 'close') {
		      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
		      Object.assign(client, { status: 'close'})
		      users[client.id] = undefined;
		      // reconnect if not logged out
		      console.log(client.user)
		      if(shouldReconnect) {

		        this.initialize({ client })
		      }
		     
		    } 

		    if(connection === 'connecting'){
		    	Object.assign(client, { status: 'connecting'})
		    	console.log(client.user)
		    	return;
		    }
		    if(connection === 'open') {
		      console.log('opened connection')
		      Object.assign(client, { status: 'open'})
		      console.log(client.user)
		      this.onMessage()

		    }else if(qr){
		    	
		    	qrcode.generate(qr, {small: true})
		    }
		    

		})

		
	}


	onMessage(){
		this.socket.ev.on('messages.upsert', (msg) => {
			const conversation = msg["messages"][0]["message"]["conversation"]
			const remoteJid = msg["messages"][0]["key"]["remoteJid"]
			const name = msg["messages"][0]["pushName"]

			console.log(JSON.stringify(msg, null, 4))
			//console.log(conversation)
			if(/oi/.test(conversation.toLowerCase())){
				this.typeMessage({ from: remoteJid, text: `Olá, ${name}`})
			}
		})
	}

	async typeMessage({ from, text}){
		await this.socket.sendMessage(from, {text})
	}
}

module.exports = WAConnection
