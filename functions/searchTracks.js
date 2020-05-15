const axios = require('axios')
const { searchTracks } = require('./lib/musixmatch')

exports.handler = async function (event, context, callback) {
  const { q } = event.queryStringParameters

  const res = await axios({
    url: searchTracks({ q }),
    method: 'GET',
    crossdomain: true
  })

  const body = res && res.data && res.data.message && res.data.message.body

  if (!body) {
    callback({ message: "Tracks not found." }, {
      statusCode: 500
    })
    return
  }

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(body)
  })
}