<div style="text-align:center">
  <img src="https://patrick-sachs.de/api/files/serve/logo-512x512-png-png-b6cd" style="width:40%;" />
</div>

# Helios 

A minimalistic CMS for the modern web.

- **Mobile first** - Responsive by design
- **Modern technologies** - Progressive web app, web push, automatic HTTPs
- **Small size** for emerging markets - Webpage size is ~250kb
- Optimized for **privacy** - No user data is stored unless opted in

Live Demo: [https://patrick-sachs.de/](https://patrick-sachs.de/)

Wiki/Guide: [https://github.com/PatrickSachs/helios/wiki](https://github.com/PatrickSachs/helios/wiki)

## What is Helios?

Helios is a CMS("Content Management System") optimized for **small to medium websites** which just need "to get the job done".

This is done by only including the features that are **actually required**, all while utilizing the latest technologies available.

## Live production websites using Helios

| [<img src="https://patrick-sachs.de/static/content/system/logo.png" width="100px;"/><br /><sub><b>patrick-sachs.de</b></sub>](https://patrick-sachs.de) | [<img src="https://sahnee.de/static/content/system/logo.png" width="100px;"/><br /><sub><b>sahnee.de</b></sub>](https://sahnee.de) |
| :---: | :---: |

## Feature List

- Helios was developed with a **mobile first** approach. (Responsive, Add to home screen, push notifications, ...)
- Helios is lightweight - Low resource usage on the server, **fast load speeds** for your visitors due to Server Side Rendering & Compression.
- Helios is **MIT licensed** - You can do WHATEVER you want with it.
- Helios is **secure**, traffic is served over HTTPS only(Free SSL certificate included).
- Helios allows you to create **users with different permissions**. Some people write blog posts, while others fill static pages with content.

## The technical section

If you're just looking to use Helios and do not intend to join in and help develop Helios(which would be awesome, Helios is open source!), you can stop reading here.

### Develop

- **Warning** - Server side code(`/src/server`) does not support hot reloading, you need to *restart* the dev server if you change any code within!
- **Package Manager** - NPM. I know, Yarn & Co are faster and so and and so forth, but I'd rather not add another tool to the ecosystem.
- **Code Editor** - Visual Studio Code - It just works™️
- **Database** - MongoDB. It's a great database.
- **Code Style** - ES6 with JSX. Server side is CommonJS, client side is ES modules.

```
$ npm install
$ npm run dev
```

### Compile/Deploy

**Important**: Make sure to adjust the config files(`/src/config`). These contain your private keys for passwords. If you leave them at their default values, it will be rather trivial to decrypt your senstive user data.

They are named `client.example.js` and `server.example.js`. Make sure to give to omit the `.example` from the file names of the configured files. There is also a `style.example.sass`. You'll want to rename that one too.

```
$ npm install
$ npm run build
$ npm run start
```

Take a look at the [Wiki](https://github.com/PatrickSachs/helios/wiki) for a more detailed explanation and a walk through of all steps required.

### Contributing

As always contributions are more than welcome!

Feel free to skim through the codebase and tackle some TODOs, take a look at the issues page or just randomly shoot PRs at me.
