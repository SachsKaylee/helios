const config = require("../../config/server");

const install = ({ server, $send }) => {
  server.get("/manifest.json", (req, res) => {
    $send(res, {
      data: {
        "short_name": config.client.title,
        "name": config.client.title,
        "description": config.client.description,
        "lang": "en-US", // todo: Localize Helios one day
        "icons": [
          makeManifestIcon(256)
        ],
        "start_url": "/",
        "scope": "/",
        "theme_color": "aliceblue",
        "background_color": "white",
        "display": "standalone"
      }
    })
  });
}

const makeManifestIcon = size => ({
  "src": `/static/content/system/logo-${size}x${size}.png`,
  "type": "image/png",
  "sizes": `${size}x${size}`
});

module.exports = { install }