const axios = require('axios')
const { getTrackLyrics } = require('./lib/musixmatch')

exports.handler = async function (event, context, callback) {
  const { trackId } = event.queryStringParameters

  const res = await axios({
    url: getTrackLyrics({ trackId }),
    method: 'GET',
    crossdomain: true
  })

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