# Django web app generator [![Build Status](https://secure.travis-ci.org/rockallite/generator-django-webapp.png?branch=master)](http://travis-ci.org/rockallite/generator-django-webapp) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

[Yeoman](http://yeoman.io) generator that scaffolds out a Django web app with front-end support. Derived from [generator-webapp](https://github.com/yeoman/generator-webapp/).

## Features

* CSS Autoprefixing *(new)*
* Built-in preview server with LiveReload
* Automagically compile CoffeeScript & Compass
* Automagically lint your scripts
* Automagically wire up your Bower components with [bower-install](#third-party-dependencies).
* Awesome Image Optimization (via OptiPNG, pngquant, jpegtran and gifsicle)
* Mocha Unit Testing with PhantomJS
* Optional - Bootstrap for Sass
* Optional - Leaner Modernizr builds *(new)*
* Auto-generated config paths of all RequireJS modules
* Automagically transfer Django template static URL prefix (`{{ STATIC_URL }}`) to processed HTML templates

For more information on what `generator-webapp` can do for you, take a look at the [Grunt tasks](https://github.com/yeoman/generator-webapp/blob/master/app/templates/_package.json) used in our `package.json`.


## Getting Started

- Install: `npm install -g generator-django-webapp`
- Run: `yo django-webapp`
- Run `grunt` for building and `grunt serve` for preview [*](#serve-note)


#### Third-Party Dependencies

*(HTML/CSS/JS/Images/etc)*

Third-party dependencies are managed with [bower-install](https://github.com/stephenplusplus/grunt-bower-install). Add new dependencies using **Bower** and then run the **Grunt** task to load them:

```bash
  bower install --save jquery
  grunt bowerInstall
```

This works if the package author has followed the [Bower spec](https://github.com/bower/bower.json-spec). If the files are not automatically added to your index.html, check with the package's repo for support and/or file an issue with them to have it updated.

To manually add dependencies, `bower install depName --save` to get the files, then add a `script` or `style` tag to your `index.html` or an other appropriate place.

The components are installed in the root of the project at `/bower_components`. To reference them from the `grunt serve` web app `index.html` file, use `src="bower_components"` or `src="/bower_components"`. Treat the references as if they were a sibling to `index.html`.

*Testing Note*: a project checked into source control and later checked out, needs to have `bower install` run from the `test` folder as well as from project root.


#### Grunt Serve Note

Note: `grunt server` was previously used for previewing in earlier versions of the project and is being deprecated in favor of `grunt serve`.


## Options

* `--skip-install`

  Skips the automatic execution of `bower` and `npm` after scaffolding has finished.

* `--test-framework=<framework>`

  Defaults to `mocha`. Can be switched for another supported testing framework like `jasmine`.

* `--coffee`

  Add support for [CoffeeScript](http://coffeescript.org/).


## Contribute

Main development happens in Yeoman's `generator-webapp`. See the [contributing docs](https://github.com/yeoman/yeoman/blob/master/contributing.md)

`generator-django-webapp` is fork-friendly (and is also a fork of `generator-webapp`) and you can always maintain a custom version which you `npm install && npm link` to continue using via `yo django-webapp` or a name of your choosing.


## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
