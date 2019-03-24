const webPush = require("web-push");
const mongoose = require('mongoose');
const encrypt = require('../../utils/encrypt');
const niceUri = require('../../utils/nice-uri');
const useragent = require('useragent');
const { permissions } = require("../../common/permissions");

const VersionDetails = {
  family: String,
  major: String,
  minor: String,
  patch: String,
};

const Subscription = mongoose.model("subscription", new mongoose.Schema({
  _id: String,
  // TODO: Remove this and don't show any details to the admin. I don't like this in the face of GDPR.
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

/**
 * The ID always used to the VAPID document.
 */
const VAPID_ID = "vapid";

/**
 * The VAPID document.
 */
const Vapid = mongoose.model("vapid", new mongoose.Schema({
  _id: { type: String, default: VAPID_ID },
  publicKey: { type: String },
  privateKey: { type: String }
}, { collection: "settings" }));

/**
 * Gets the VAPID document.
 */
const getVapid = () => Vapid.findById(VAPID_ID);

const sendPush = async (payload) => {
  payload = JSON.stringify(payload);
  const subs = await Subscription.find({});
  const res = await Promise.all(subs.map(sub => webPush.sendNotification(sub.subscription, payload).catch(error => {
    if (error.statusCode === 410) {
      error.subscription = sub;
      return error;
    }
    throw error;
  })));
  const oldIds = res.filter(res => res.statusCode === 410).map(res => res.subscription._id);
  if (oldIds.length) {
    await Subscription.deleteMany({ _id: { $in: oldIds } });
  }
  return res;
};

// Misc operations
const filterSubscriptionData = ({ _id, device, browser, os, since }) => ({ _id, device, browser, os, since });

const preinstall = async ({ }) => {
  let vapid = await Vapid.findById(VAPID_ID);
  if (!vapid) {
    console.log("Did not find VAPID keys ... Generating now.");
    const keys = webPush.generateVAPIDKeys();
    vapid = new Vapid({
      _id: VAPID_ID,
      publicKey: keys.publicKey,
      privateKey: keys.privateKey
    });
    await vapid.save();
  }
  // TODO: Don't use process.env.mail, use the one from the settings.
  webPush.setVapidDetails("mailto:" + process.env.MAIL, vapid.publicKey, vapid.privateKey);
};

const install = ({ server }) => {
  // API specific middlemare
  server.use((req, res, next) => {
    // Get subscription data
    req.subscription = {};
    req.subscription.vapid = getVapid;

    // Senders
    res.sendSubscription = async (subscription) => {
      Array.isArray(subscription)
        ? res.result({ data: subscription.map(filterSubscriptionData) })
        : res.result({ data: filterSubscriptionData(subscription) });
    }

    next();
  });

  /**
   * Gets the VAPID public key of this server.
   */
  server.get("/api/subscription/vapid", async (req, res) => {
    const vapid = await req.subscription.vapid();
    res.result({
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
      if (!user.hasPermission(permissions.subscriber)) {
        return res.error.missingPermission(permissions.subscriber);
      }
      const subs = await Subscription.find({}).exec();
      res.sendSubscription(subs);
    } catch (error) {
      return res.result(error);
    }
  });

  /**
   * Gets the amount of people currently subscribed to this blog.
   */
  server.get("/api/subscription/count", (req, res) =>
    Subscription
      .estimatedDocumentCount()
      .exec()
      .then(count => res.result({ data: { count } }))
      .catch(error => res.result(error)));

  /**
   * Subscribes to this blog.
   */
  server.post("/api/subscription/subscribe", async (req, res) => {
    try {
      const internalConfig = await req.system.internal();
      const { device, subscription } = req.body;
      const _id = encrypt(subscription.endpoint, internalConfig.subscriptionSecret);
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
      res.result({ data: push });
    }
    catch (error) {
      res.result(error);
    }
  });

  /**
   * Sends a new message to all subscribers.
   */
  server.post("/api/subscription/send", async (req, res) => {
    try {
      const user = await req.user.getUser();
      if (!user.hasPermission(permissions.subscriber)) {
        return res.error.missingPermission(permissions.subscriber);
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
};

module.exports = { preinstall, install, sendPush };
