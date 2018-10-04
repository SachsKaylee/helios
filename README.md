# Helios

A minimalistic CMS using Node.js and React!

We use Bulma as CSS Framework, next.js for Server Side Rendering and Slate as Content Editor.

Live Demo: [https://helios.patrick-sachs.de/](https://helios.patrick-sachs.de/)

## Why?

There are tons of CMS out there. Wordpress dwarfs the market with tons of extensions and great support. So why another one?

There are two very simple reasons why I wrote Helios:

- I want something simple. No monolythic codebase behind the scenes, no uncertainty what happens with my data.
- I'm not a fan of PHP, which most popular CMS are written in. It's a battle proven language, but I believe that the technology has exceeded its lifespan.

Why should you **use** Helios?

- Helios was developed with a **mobile first** approach.
- Helios is lightweight - Low resource usage on the server, **fast load speeds** for your visitors due to Server Side Rendering & Compression.
- Helios is **easily forkable** - Getting into the codebase and changing things to your liking isn't difficult.
- Helios is **MIT licensed** - You can do WHATEVER you want with it.
- Helios is secure, traffic is served over HTTPS(preferably HTTP/2) only(It doesn't even require you to know anything about SSL. It's **automatically encrypted** with a valid certificate!).

Why should you **not use** Helios?

- Helios does not offer a plugin system.
- Helios is mainly aimed at developers. If you want to customize something, you are required to touch a code file.
- Helios doesn't like to run outside of server environments. It does run, but requires you to have some knowledge about SSL.

## Develop

**Warning**: Server side code(`/src/server`) does not support hot reloading, you need to *restart* the dev server if you change any code within!

**Package Manager**: NPM. I know, Yarn & Co are faster and so and and so forth, but I'd rather not add another tool to the ecosystem.

**Code Editor**: Visual Studio Code - It just works™️

```
$ npm install
$ npm run dev
```

## Compile/Deploy

**Important**: Make sure to adjust the config files(`/src/config`). These contain your private keys for passwords. If you leave them at their default values, it will be rather trivial to decrypt your senstive user data you are bound by law to protect.

```
$ npm install
$ npm run build
$ npm run start
```

Take a look at the [Wiki](https://github.com/PatrickSachs/helios/wiki) for a more detailed explanation and a walk through of all steps required.

## Contributing

Always welcome!

Make sure to read `CONTRIBUTING.md` and `STYLE.md` beforehand though.
