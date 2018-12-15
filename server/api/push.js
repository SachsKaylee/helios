const config = require("../../config/server");
const webPush = require("web-push");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const niceUri = require('../../utils/nice-uri');

const PushSubscription = mongoose.model("push-subscription", new mongoose.Schema({
  _id: String,
  // https://www.npmjs.com/package/web-push#usage
  subscription: {
    endpoint: String,
    keys: {
      auth: String,
      p256dh: String
    }
  }
}));

const vapidDir = path.resolve("./.helios/vapid/");
const vapidFile = path.join(vapidDir, "keys.json");

let vapid;
try {
  console.log("Loading VAPID keys from:", vapidFile);
  vapid = JSON.parse(fs.readFileSync(vapidFile));
} catch (e) {
  console.error("Failed to load VAPID keys - generating now. This error is expected on first startup.", e.message);
  vapid = webPush.generateVAPIDKeys();
  fs.mkdirSync(vapidDir, { recursive: true });
  fs.writeFileSync(vapidFile, JSON.stringify(vapid));
}

webPush.setVapidDetails("mailto:" + config.webmasterMail, vapid.publicKey, vapid.privateKey);

const sendPush = async (payload) => {
  payload = JSON.stringify(payload);
  const subs = await PushSubscription.find({});
  return Promise.all(subs.map(sub => webPush.sendNotification(sub.subscription, payload)));
};

const install = ({ server }) => {
  server.get("/api/push/vapid", (req, res) => {
    res.sendData({
      data: {
        key: vapid.publicKey
      }
    });
  })

  server.post("/api/push/subscribe", async (req, res) => {
    const subscription = req.body;
    const _id = Buffer.from(subscription.endpoint).toString("base64");
    let push = await PushSubscription.findById(_id);
    if (!push) {
      push = new PushSubscription({ _id, subscription });
    } else {
      push.set({ subscription });
    }
    push.save({ upsert: true })
      .then(push => res.sendData({ data: push }))
      .catch(error => res.error.server(error))
  });

  server.get("/api/push/test", async (req, res) => {
    const resu = await sendPush({
      _id: niceUri("Test Push"),
      title: "Test Push",
      body: "This is a push message.",
      url: "https://ip.patrick-sachs.de/page/this-sh-t-will-f-ck-you-up-2014"
    });
    res.status(200).end();
    console.log("res:", resu)
  })
}

module.exports = { install, sendPush }
