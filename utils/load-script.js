/**
 * Loads the given script at the given URL and runs it. XSS danger!
 */
const loadScript = ({ url }) => new Promise((resolve, reject) => {
  const id = "script@" + url;
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    document.body.appendChild(script);
    script.onload = () => resolve(script);
    script.onerror = reject;
    script.async = true;
    script.src = url;
  } else {
    resolve(script);
  }
});

module.exports = loadScript;
