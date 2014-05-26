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
* Auto-generated config paths of all RequireJS modules *(new)*
* Automagically handle `{{ STATIC_URL }}` and `{% static %}` template tags *(new)*
* Optimze HTML files and Django templates, including inline Javascript and CSS (using grunt-htmlcompressor) *(new)*

`generator-django-webapp` depends on a heavily-patched version of `grunt-usemin`. For more information on what `generator-django-webapp` can do for you, take a look at the [Grunt tasks](https://github.com/rockallite/generator-django-webapp/blob/master/app/templates/Gruntfile.js).


## Getting Started

- Install: `npm install -g generator-django-webapp`
- Start a Django project: `django-admin.py startproject your_project_name`
- Set working directory to project base: `cd your_project_name`
- Run: `yo django-webapp`
- Set working directory for Grunt task: `cd etc`
- Run `grunt` for building static assets
- If everything is OK, the built assets are in `etc/dist` directory

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


#### Django Templates Note
Note: Because `htmlcompressor` is used to optimize HTML and its inline JavaScript and CSS, **all inline JavaScript and CSS must be valid**. This means **no Django template tags allowed inside JavaScript or CSS**, with one exceptions: string literals.

For example, the follow JavaScript is valid:
```html
<script>
userId = '{{ user.id }}';
</script>
```

However, the follow one is not, because there are syntax errors of JavaScript, which causes `htmlcompressor` task fail:
```html
<script>
{% if user.is_authenticated %}
   userId = '{{ user.id }}';
{% else %}
   userId = null;
{% endif %}
</script>
```

You must rewrite it as:
```html
{% if user.is_authenticated %}
<script>userId = '{{ user.id }}'</script>
{% else %}
<script>userId = null;</script>
{% endif %}
```

or use the "skip-block" feature of `htmlcompressor` to completely ignore  compression of a specific block of inline script:
```html
<!-- {{{ -->
<script>
{% if user.is_authenticated %}
  userId = '{{ user.id }}';
{% else %}
  userId = null;
{% endif %}
</script>
<!-- }}} -->
```

Anything between `<!-- {{{ -->` and `<!-- }}} -->` will be preserved as-is and not compressed.

Django template tags inside HTML are valid, though.

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
