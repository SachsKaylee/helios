/** ********************************
 * 
 * This is the Helios CLIENT configuration file.
 * Please take your time to configure the client to your system.
 * 
 * You can find a comprehensive guide about all settings here:
 * https://github.com/PatrickSachs/helios/wiki/Client-Configuration
 * 
 * YOUR SERVER WILL NOT WORK WITHOUT ADJUSTING THESE SETTINGS!
 * 
 ******************************** */

 module.exports = {
  // The title/name of your website
  title: "Helios",

  // A short one-liner what your website is about.
  description: "A minimalistic CMS using Node.js and React.",

  // Some on tags what your website is about.
  topics: ["helios", "cms", "react", "node.js"],

  // Host on these domains. The first domain will be your primary, canocial URL
  // IPs are NOT ALLOWED if using { certs: "lets-encrypt" } (which is the default)
  // in the server.js config!
  domains: ["helios.example.com", "www.helios.example.com"],

  // The port your server runs on. You typically don't want to change this. Make 
  // sure to forward the port(s)!
  port: {
    // We also have a http port in case the user connects to that. They are automatically
    // redirected to https in that case. Set this to null to disable listing to http 
    // entirely. (Not recommended as of now, this might change in a few years though)
    http: 80,
    // This is the port the application actually runs on. Helios runs over HTTPS only.
    https: 443
  },

  // The locale of the CMS. Create a new .js file in /src/locale and then add its ID here.
  locale: require("../locale/en"),

  // The max size in bytes for user avatars.
  maxAvatarSize: 200 * 1024,

  // How many posts should be displayed per page?
  postsPerPage: 10,

  // How many posts should be displayed on the about page of a user?
  postsPerAboutPage: 3,

  // Should the log in button in the navigation be hidden?
  hideLogInButton: false,

  // The default tags a post should have.
  defaultTags: ["uncategorized"],

  // After how many seconds a user has spent on your site will they be prompted to enable notifications?
  promptForNotificationsAfter: 60
}
