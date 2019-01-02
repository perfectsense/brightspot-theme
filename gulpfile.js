const autoprefixer = require('autoprefixer')
const Styleguide = require('brightspot-styleguide')
const gulp = require('gulp')
const fs = require('fs')
const plugins = require('gulp-load-plugins')()
const Builder = require('systemjs-builder')
const exec = require('child_process').execSync
const path = require('path')

const styleguide = new Styleguide(gulp, {build: process.env.STYLEGUIDE_BUILD_DIRECTORY})

gulp.task(styleguide.task.less(), () => {
  return gulp.src('styleguide/All.less', { base: '.' })
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.less())
    .pipe(plugins.postcss([ autoprefixer('last 2 versions') ]))
    .pipe(plugins.cleanCss())
    .pipe(plugins.rename({ extname: '.min.css' }))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(styleguide.path.build()))
})

gulp.task(styleguide.task.extra('amp'), () => {
  return gulp.src('styleguide/Amp.less', { base: 'styleguide' })
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.less())
    .pipe(plugins.postcss([autoprefixer('last 2 versions')]))
    .pipe(plugins.cleanCss())
    .pipe(plugins.rename({extname: '.min.css.amp.hbs'}))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(styleguide.path.build()))
})

gulp.task(styleguide.task.js(), done => {
  let builder = new Builder()

  builder.config({
    defaultJSExtensions: true,
    map: {
      'plugin-babel': 'node_modules/systemjs-plugin-babel/plugin-babel.js',
      'systemjs-babel-build': 'node_modules/systemjs-plugin-babel/systemjs-babel-browser.js',
    },
    transpiler: 'plugin-babel'
  })

  let buildOptions = {
    minify: false
  }

  builder.buildStatic('styleguide/All.js', buildOptions).then(output => {
    gulp.src([ ])
      .pipe(plugins.file('styleguide/All.js', output.source))
      .pipe(gulp.dest(styleguide.path.build()))
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.uglify({mangle: { keep_fnames: true} }))
      .pipe(plugins.rename({ extname: '.min.js' }))
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest(styleguide.path.build()))
      .on('end', done)
  })
})

var themePath = './themes/'
function getFolders (dir) {
  return fs.readdirSync(dir)
    .filter(function (file) {
      return fs.statSync(path.join(dir, file)).isDirectory()
    })
}

gulp.task('build-theme', function () {
  const folders = getFolders(themePath)
  for (var i in folders) {
    if (folders[i] !== '.template') {
      var folderPath = 'themes/' + folders[i]
      exec('gulp', {
        cwd: folderPath
      })
    }
  }
})
