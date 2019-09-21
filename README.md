<img align="right" src="https://patrick-sachs.de/api/files/serve/logo-512x512-png-png-b6cd"> 

# Helios 

A minimalistic CMS for the modern web.

- **Mobile first** - Responsive by design
- **Modern technologies** - Progressive web app, web push, automatic HTTPS, ...
- **Small size** for emerging markets - Webpage size is ~250kb
- Optimized for **privacy** - No user data is stored unless opted in

Live Demo: [https://patrick-sachs.dev/](https://patrick-sachs.dev/)

Wiki/Guide: [https://github.com/PatrickSachs/helios/wiki](https://github.com/PatrickSachs/helios/wiki)

## What is Helios?

Helios is a CMS("Content Management System") optimized for **small to medium websites** which just need "to get the job done".

This is done by only including the features that are **actually required**, all while utilizing the latest technologies available.

## Live production websites using Helios

| [<img src="https://patrick-sachs.dev/static/content/system/logo.png" width="100px;"/><br /><sub><b>patrick-sachs.dev</b></sub>](https://patrick-sachs.dev) |
| :---: |

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

```
$ npm install
$ npm run build
$ npm run start
```

Take a look at the [Wiki](https://github.com/PatrickSachs/helios/wiki) for a more detailed explanation and a walk through of all steps required.

### Contributing

As always contributions are more than welcome!

Feel free to skim through the codebase and tackle some TODOs, take a look at the issues page or just randomly shoot PRs at me.
