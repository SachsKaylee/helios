const install = ({ server }) => {
  server.get("/manifest.json", async (req, res) => {
    const config = req.system.config();
    res.sendData({
      data: {
        "short_name": config.title,
        "name": config.title,
        "description": config.description,
        "lang": config.locale,
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
