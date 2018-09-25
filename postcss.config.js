module.exports = {
  plugins: [
    require('postcss-easy-import')({prefix: '_'})
    //require('autoprefixer')({  }) // Breaks Next.js 7
  ]
}