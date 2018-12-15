const config = require("../../config/server");
const webPush = require("web-push");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const encrypt = require('../../utils/encrypt');
const niceUri = require('../../utils/nice-uri');
const useragent = require('useragent');

const VersionDetails = {
  family: String,
  major: String,
  minor: String,
  patch: String,
};

const Subscription = mongoose.model("subscription", new mongoose.Schema({
  _id: String,
  device: VersionDetails,
  os: VersionDetails,
  browser: VersionDetails,
  since: Date,
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
  const subs = await Subscription.find({});
  return Promise.all(subs.map(sub => webPush.sendNotification(sub.subscription, payload)));
};

// Misc operations
const filterSubscriptionData = ({ _id, device, browser, os, since }) => ({ _id, device, browser, os, since });

const install = ({ server }) => {
  // API specific middlemare
  server.use((req, res, next) => {
    // Get User & Session data
    req.subscription = {};

    // Senders
    res.sendSubscription = async (subscription) => {
      Array.isArray(subscription)
        ? res.sendData({ data: subscription.map(filterSubscriptionData) })
        : res.sendData({ data: filterSubscriptionData(subscription) });
    }

    next();
  });

  /**
   * Gets the VAPID public key of this server.
   */
  server.get("/api/subscription/vapid", (req, res) => {
    res.sendData({
      data: {
        key: vapid.publicKey
      }
    });
  });

  /**
   * Gets everyone currently subscribed to this blog.
   */
  server.get("/api/subscription", async (req, res) => {
    try {
      const user = await req.user.getUser();
      if (!user.hasPermission("community-manager")) {
        return res.error.missingPermission("community-manager");
      }
      const subs = await Subscription.find({}).exec();
      res.sendSubscription(subs);
    } catch (error) {
      if (error === "not-logged-in") {
        return res.error.notLoggedIn();
      } else {
        return res.error.server(error);
      }
    }
  });

  /**
   * Gets the amount of people currently subscribed to this blog.
   */
  server.get("/api/subscription/count", (req, res) =>
    Subscription
      .count({})
      .exec()
      .then(count => res.sendData({ data: { count } }))
      .catch(error => res.error.server(error)));

  /**
   * Subscribes to this blog.
   */
  server.post("/api/subscription/subscribe", async (req, res) => {
    try {
      const { device, subscription } = req.body;
      const _id = encrypt(subscription.endpoint, config.subscriptionSecret);
      let push = await Subscription.findById(_id);
      const agent = useragent.parse(device);
      if (!push) {
        push = new Subscription({
          _id, subscription,
          since: new Date(),
          device: agent.device.toJSON(),
          os: agent.os.toJSON(),
          browser: agent.toJSON(),
        });
      } else {
        push.set({
          subscription,
          device: agent.device.toJSON(),
          os: agent.os.toJSON(),
          browser: agent.toJSON(),
        });
      }
      push = await push.save({ upsert: true });
      res.sendData({ data: push });
    }
    catch (error) {
      res.error.server(error);
    }
  });

  /**
   * Sends a new message to all subscribers.
   */
  server.post("/api/subscription/send", async (req, res) => {
    try {
      const user = await req.user.getUser();
      if (!user.hasPermission("community-manager")) {
        return res.error.missingPermission("community-manager");
      }
      const push = req.body;
      push._id = "user-" + niceUri(push.title);
      const pushResult = await sendPush(push);
      res.sendData({ data: { count: pushResult.length } });
    } catch (error) {
      if (error === "not-logged-in") {
        return res.error.notLoggedIn();
      } else {
        return res.error.server(error);
      }
    }
  })
}

module.exports = { install, sendPush }
