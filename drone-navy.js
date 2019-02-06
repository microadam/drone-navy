const Primus = require('primus')
const Emitter = require('primus-emitter')
const Socket = Primus.createSocket({
  transformer: 'websockets',
  parser: 'JSON',
  plugin: { emitter: Emitter }
})

const admiralHost = process.env.ADMIRAL_HOST
const appId = process.env.PLUGIN_APPID
const order = process.env.PLUGIN_ORDER
const version = process.env.PLUGIN_VERSION

if (!admiralHost || !appId || !order || !version) {
  console.log('ADMIRALHOST, APPID, ORDER and VERSION must all be set')
  process.exit(1)
}

const environment = version.includes('-') ? 'staging' : 'production'

const client = new Socket(admiralHost, { strategy: false })

client.on('error', error => {
  console.log(error)
  client.end()
})

client.on('open', () => {
  client.on('serverMessage', data => {
    var msg = 'Admiral: ' + data.message
    console.log(msg)
  })

  client.on('captainMessage', data => {
    var msg = data.captainName + ': ' + data.message
    console.log(msg)
  })

  client.send('register', null, response => {
    clientId = response.clientId
    const data = {
      appId: appId,
      environment: environment,
      order: order,
      orderArgs: [ version ],
      clientId: clientId,
      username: 'DRONE',
    }
    client.send('executeOrder', data, response => {
      if (response.success) {
        console.log('ORDER EXECUTED')
      } else {
        if (response.message) console.log(response.message)
        process.exit(1)
      }
      client.end()
    })
  })
})