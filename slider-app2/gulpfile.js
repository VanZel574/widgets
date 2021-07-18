// VARIABLES & PATHS

let preprocessor = 'sass', // Preprocessor (sass, scss, less, styl)
    fileswatch   = 'html,htm,txt,json,md,woff2', // List of files extensions for watching & hard reload (comma separated)
    imageswatch  = 'jpg,jpeg,png,webp,svg', // List of images extensions for watching & compression (comma separated)
    baseDir      = 'app', // Base directory path without «/» at the end
    online       = true; // If «false» - Browsersync will work offline without internet connection

let paths = {

	scripts: {
		src: [
			// 'node_modules/jquery/dist/jquery.min.js', // npm vendor example (npm i --save-dev jquery)
			baseDir + '/libs/common/' // app.js. Always at the end
		],
		dest: baseDir + '/js',
	},

	styles: {
		src:  baseDir + '/' + preprocessor + '/pages/**/*.' + preprocessor,
		dest: baseDir + '/css',
	},

	images: {
		src:  baseDir + '/images/src/**/*',
		dest: baseDir + '/images/dest',
	},

	deploy: {
		hostname:    'username@yousite.com', // Deploy hostname
		destination: 'yousite/public_html/', // Deploy destination
		include:     [/* '*.htaccess' */], // Included files to deploy
		exclude:     [ '**/Thumbs.db', '**/*.DS_Store' ], // Excluded files from deploy
	},

	build: {
		dest: baseDir + '/dist',
		scriptsDest: baseDir + '/dist/js',
		stylesDest: baseDir + '/dist/css',
		htmlDest: baseDir + '/dist/templates',
		imagesDest: baseDir + '/dist/images'
	},

}

// LOGIC

const fs = require('fs')
const rimraf = require('rimraf')
const { src, dest, parallel, series, watch } = require('gulp');
const sass          = require('gulp-sass');
const cleancss      = require('gulp-clean-css');
const concat        = require('gulp-concat');
const browserSync   = require('browser-sync').create();
const autoprefixer  = require('gulp-autoprefixer');
const imagemin      = require('gulp-imagemin');
const newer         = require('gulp-newer');
const rsync         = require('gulp-rsync');
const del           = require('del');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const rev           = require('gulp-rev');
const revdel        = require('gulp-rev-delete-original');
const rename        = require('gulp-rename')

// DEVELOPMENT SECTION

function browsersync() {
	browserSync.init({
		server: { baseDir: baseDir + '/' },
		notify: false,
		online: online,
		index: '/templates/index.html'
	})
}

function scripts() {
	// webpack development mode
	webpackConfig.mode = 'development'
	webpackConfig.watch = true

	return src(paths.scripts.src)
		.pipe(webpackStream(webpackConfig))
		.pipe(dest(paths.scripts.dest))
		.pipe(browserSync.stream())
}

function styles() {
	return src(paths.styles.src)
		.pipe(eval(preprocessor)())
		.pipe(rename({dirname: ''})) // remove folders
		.pipe(dest(paths.styles.dest))
		.pipe(browserSync.stream())
}

function images() {
	return src(paths.images.src)
		.pipe(newer(paths.images.dest))
		.pipe(imagemin())
		.pipe(dest(paths.images.dest))
}

function cleanimg() {
	return del('' + paths.images.dest + '/**/*', { force: true })
}

function deploy() {
	return src(baseDir + '/')
	.pipe(rsync({
		root: baseDir + '/',
		hostname: paths.deploy.hostname,
		destination: paths.deploy.destination,
		include: paths.deploy.include,
		exclude: paths.deploy.exclude,
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
}

function startwatch() {
	watch(baseDir  + '/**/' + preprocessor + '/**/*', styles);
	watch(baseDir  + '/**/*.{' + imageswatch + '}', images);
	watch(baseDir  + '/**/*.{' + fileswatch + '}').on('change', browserSync.reload);
	// watch(baseDir + '/common/*.js', scripts);
}


// BUILD SECTION

async function buildDist() {
	if(!fs.existsSync(paths.build.dest)) {
		fs.mkdirSync(paths.build.dest)
	} else {
		rimraf.sync(paths.build.dest) // delete folder
		fs.mkdirSync(paths.build.dest)
	}
}

function buildScripts() {
	// webpack production mode
	webpackConfig.mode = 'production'
	webpackConfig.watch = false

	return src(paths.scripts.src)
		.pipe(webpackStream(webpackConfig))
		.pipe(dest(paths.build.scriptsDest))
}

function buildStyles() {
	return src(paths.styles.dest + '/*.css')
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
		.pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
		.pipe(dest(paths.build.stylesDest))
}

function hashFiles() {
	return src([paths.build.scriptsDest + '/*.js', paths.build.stylesDest + '/*.css'], {base: paths.build.dest})
		// .pipe(dest(paths.build.dest)) // copy original files to dist
		.pipe(rev())
		.pipe(dest(paths.build.dest)) // write rev'd files
		.pipe(revdel())               // delete original files
		.pipe(rev.manifest())
		.pipe(dest(paths.build.dest))
}

function buildTemplates() {
	return src(baseDir + '/templates' + '/**/*.html')
		.pipe(dest(paths.build.htmlDest))
}

function buildImages() {
	return src(baseDir + '/images/dest/**/*')
		.pipe(dest(paths.build.imagesDest))
}



// TASKS SECTION

// exports.browsersync = browsersync;
// exports.assets      = series(cleanimg, styles, scripts, images);
// exports.styles      = styles;
// exports.scripts     = scripts;
// exports.images      = images;
// exports.cleanimg    = cleanimg;
// exports.deploy      = deploy;
exports.default     = parallel(images, styles, scripts, browsersync, startwatch);
exports.build       = series(buildDist, buildScripts, buildStyles, buildTemplates);
