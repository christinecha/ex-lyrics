const axios = require('axios')
const { getRichSync } = require('./lib/musixmatch')

exports.handler = async function (event, context, callback) {
  const { trackId } = event.queryStringParameters

  const res = await axios({
    url: getRichSync({ trackId }),
    method: 'GET',
    crossdomain: true
  })

  console.log(res.data)

  const body = res && res.data && res.data.message && res.data.message.body

  if (!body) {
    callback({ message: "Lyrics not found." }, {
      statusCode: 500
    })
    return
  }

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(body)
  })
}