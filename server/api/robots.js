const install = ({ server }) => {
  /**
   * The manifest.json for PWAs. Gives them some basic information about our website.
   */
  server.get("/manifest.json", async (req, res) => {
    try {
      const config = await req.system.config();
      return res.result({
        data: {
          "short_name": config.title,
          "name": config.title,
          "description": config.description,
          "lang": config.locale,
          "icons": [
            makeManifestIcon(192, config.logo),
            makeManifestIcon(512, config.logo)
          ],
          "start_url": "/",
          "scope": "/",
          // TODO: Make these two values either configurable or infer them from the current theme (preferred).
          "theme_color": "aliceblue",
          "background_color": "white",
          "display": "standalone"
        }
      });
    } catch (error) {
      return res.result(error);
    }
  });
};

/**
 * Creates a single manifest logo entry.
 * @param {number} size The size.
 * @param {{[key: number]: string}} lookup The logo lookup.
 */
const makeManifestIcon = (size, lookup) => ({
  "src": lookup[size],
  // TODO: Look up actual type in files DB, it may not be a PNG.
  "type": "image/png",
  "sizes": `${size}x${size}`
});

module.exports = { install };
