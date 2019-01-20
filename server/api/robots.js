const config = require("../../config/server");

const install = ({ server }) => {
  server.get("/manifest.json", (req, res) => {
    res.sendData({
      data: {
        "short_name": config.client.title,
        "name": config.client.title,
        "description": config.client.description,
        "lang": config.client.locale.meta.id,
        "icons": [
          makeManifestIcon(192),
          makeManifestIcon(512)
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
