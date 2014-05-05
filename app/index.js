'use strict';
var fs = require('fs');
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var _ = require('lodash');


var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';
  this.coffee = options.coffee;

  // for hooks to resolve on mocha by default
  options['test-framework'] = this.testFramework;

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', {
    as: 'app',
    options: {
      options: {
        'skip-install': options['skip-install-message'],
        'skip-message': options['skip-install']
      }
    }
  });

  this.options = options;

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

var fileRelative = function (from, to) {
  return path.join(path.relative(path.dirname(from), path.dirname(to)), path.basename(to));
};

var djangoFail = function () {
  // Fail for any other circumstances
  console.error(chalk.red('Error: Django project not found, or project name is wrong.'));
  console.error(chalk.red('\nYou must run me in the base directory of the project\n(e.g. the one contains `manage.py` file).'));
  process.exit(1);
};

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  if (fs.existsSync('manage.py')) {
    // welcome message
    if (!this.options['skip-welcome-message']) {
      console.log(this.yeoman);
      console.log(chalk.magenta('Out of the box I include HTML5 Boilerplate, jQuery, and a Gruntfile.js to build your app.'));
    }

    // Try to figure out which is the Django project directory
    var cwd = process.cwd();
    var files = fs.readdirSync(cwd);
    var projDir = _.find(files, function (f) {
      if (f[0] === '.') return;
      var fpath = path.join(cwd, f);
      if (!fs.statSync(fpath).isDirectory()) return;
      if (fs.existsSync(path.join(fpath, '__init__.py')) && fs.existsSync(path.join(fpath, 'settings.py'))) {
          return true;
      }
    });

    // Ask the user, with detected directory as default if any
    var prompts = [{
        name: 'projectName',
        message: 'What is your Django project name?',
        default: projDir,
        validate: function (input) {
          if (!input) {
            return 'Please enter a name.';
          }
          return true;
        }
      }, {
        type: 'checkbox',
        name: 'features',
        message: 'What more would you like?',
        choices: [{
        name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: true
      },{
        name: 'Sass with Compass',
        value: 'includeCompass',
        checked: false
      },{
        name: 'Less',
        value: 'includeLess',
        checked: true
      },{
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      },{
        name: 'RequireJS',
        value: 'includeRequireJS',
        checked: true
      }]
    }];

    this.prompt(prompts, function (answers) {
      this.projectName = answers.projectName;

      var features = answers.features;

      function hasFeature(feat) { return features.indexOf(feat) !== -1; }

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeCompass = hasFeature('includeCompass');
      this.includeLess = hasFeature('includeLess');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeRequireJS = hasFeature('includeRequireJS');

      cb();      
    }.bind(this));
  }
  else {
    djangoFail();
  }
};

AppGenerator.prototype.djangoCheck = function djangoCheck() {
  // Check again
  if (this.projectName && fs.existsSync(this.projectName + '/__init__.py')) {
    if (fs.existsSync(this.projectName + '/settings.py')) {
      this.hasSettings = true;
    }
    return;
  }
  djangoFail();
};

AppGenerator.prototype.djangoProjectDir = function djangoProjectDir() {
  // Save current working directory
  var cwd = process.cwd();

  // <projectName>/spec
  var specDir = path.join(cwd, this.projectName, 'spec');

  // my
  var myDir = path.join(cwd, 'my');
  try {
    fs.mkdirSync(myDir);
  }
  catch (err) {}

  // my/requirements/
  var sourceRequirementsLocal = path.join(myDir, 'requirements/local.txt');
  try {
    fs.mkdirSync(path.dirname(sourceRequirementsLocal));
  }
  catch (err) {}
  fs.writeFile(
    sourceRequirementsLocal,
    '# This file contains Python dependencies for your local development.\n# You can also put dependencies of your choice here.\n-r common.txt\n-r dev.txt\n',
    function (err) {
      if (err) throw err;

      // Make a symbolic link
      var target = path.join(cwd, 'requirements/local.txt');
      if (fs.existsSync(target)) {
        fs.unlinkSync(target);
      }
      else {
        try {
          fs.mkdirSync(path.dirname(target));
        }
        catch (e) {}
      }
      fs.symlinkSync(fileRelative(target, sourceRequirementsLocal), target);
    }
  );

  // my/stage/
  var sourceStageSecret = path.join(myDir, 'stage/secret.py');
  try {
    fs.mkdirSync(path.dirname(sourceStageSecret));
  }
  catch (err) {}
  fs.writeFile(
    sourceStageSecret,
    '\
# -*- coding: utf-8 -*-\n\
# Put secrets here, e.g. SECRET_KEY, database settings, etc.\n\n\
SECRET_KEY = \'your-staging-secret-key\'\n\n\
DEFAULT_DATABASE_SETTING = {\n\
    \'ENGINE\': \'django.db.backends.mysql\',\n\
    \'NAME\': \'name\',\n\
    \'USER\': \'user\',\n\
    \'PASSWORD\': \'password\',\n\
    \'HOST\': \'host\',\n\
    \'PORT\': \'port\',\n\
}\n',
    function (err) {
      if (err) throw err;

      // Make a symbolic link
      var target = path.join(specDir, 'stage/secret.py');
      if (fs.existsSync(target)) {
        fs.unlinkSync(target);
      }
      else {
        try {
          fs.mkdirSync(path.dirname(target));
        }
        catch (e) {}
      }
      fs.symlinkSync(fileRelative(target, sourceStageSecret), target);
    }
  );

  // my/prod
  var sourceProdSecret = path.join(myDir, 'prod/secret.py');
  try {
    fs.mkdirSync(path.dirname(sourceProdSecret));
  }
  catch (err) {}
  fs.writeFile(
    sourceProdSecret,
    '\
# -*- coding: utf-8 -*-\n\
# Put secrets here, e.g. SECRET_KEY, database settings, etc.\n\n\
SECRET_KEY = \'your-production-secret-key\'\n\n\
DEFAULT_DATABASE_SETTING = {\n\
    \'ENGINE\': \'django.db.backends.mysql\',\n\
    \'NAME\': \'name\',\n\
    \'USER\': \'user\',\n\
    \'PASSWORD\': \'password\',\n\
    \'HOST\': \'host\',\n\
    \'PORT\': \'port\',\n\
}\n\n\
# Fill in your actual hosts!\n\
ALLOWED_HOSTS = []\n',
    function (err) {
      if (err) throw err;

      // Make a symbolic link
      var target = path.join(specDir, 'prod/secret.py');
      if (fs.existsSync(target)) {
        fs.unlinkSync(target);
      }
      else {
        try {
          fs.mkdirSync(path.dirname(target));
        }
        catch (e) {}
      }
      fs.symlinkSync(fileRelative(target, sourceProdSecret), target);
    }
  );

  // my/local
  var sourceLocalSettings = path.join(myDir, 'local/settings.py');
  try {
    fs.mkdirSync(path.dirname(sourceLocalSettings));
  }
  catch (err) {}
  fs.writeFile(
    sourceLocalSettings,
    this.engine('\
# -*- coding: utf-8 -*-\nfrom <%= projectName %>.settings import *\n\n\
WSGI_APPLICATION = \'<%= projectName %>.spec.local.wsgi.application\'\n', this),
    function (err) {
      if (err) throw err;

      // Make a symbolic link
      var target = path.join(specDir, 'local/settings.py');
      if (fs.existsSync(target)) {
        fs.unlinkSync(target);
      }
      else {
        try {
          fs.mkdirSync(path.dirname(target));
        }
        catch (e) {}
      }
      fs.symlinkSync(fileRelative(target, sourceLocalSettings), target);
    }
  );

  var sourceLocalWsgi = path.join(myDir, 'local/wsgi.py');
  try {
    fs.mkdirSync(path.dirname(sourceLocalWsgi));
  }
  catch (err) {}
  fs.writeFile(
    sourceLocalWsgi,
    this.engine('\
# -*- coding: utf-8 -*-\n\
import os\n\
os.environ.setdefault(\'DJANGO_SETTINGS_MODULE\', \'<%= projectName %>.spec.local.settings\')\n\n\
from <%= projectName %>.wsgi import application\n', this),
    function (err) {
      if (err) throw err;

      // Make a symbolic link
      var target = path.join(specDir, 'local/wsgi.py');
      if (fs.existsSync(target)) {
        fs.unlinkSync(target);
      }
      else {
        try {
          fs.mkdirSync(path.dirname(target));
        }
        catch (e) {}
      }
      fs.symlinkSync(fileRelative(target, sourceLocalWsgi), target);
    }
  );

  // spec/stage
  this.write(specDir + '/__init__.py', '');
  this.write(specDir + '/stage/__init__.py', '');

  this.write(specDir + '/stage/settings.py', this.engine('\
# -*- coding: utf-8 -*-\n\
from <%= projectName %>.settings import *\n\
from <%= projectName %>.spec.stage.secret import SECRET_KEY, DEFAULT_DATABASE_SETTING\n\n\
DATABASES[\'default\'] = DEFAULT_DATABASE_SETTING\n\n\
WSGI_APPLICATION = \'<%= projectName %>.spec.stage.wsgi.application\'\n', this));

  this.write(specDir + '/stage/wsgi.py', this.engine('\
# -*- coding: utf-8 -*-\n\
import os\n\
os.environ.setdefault(\'DJANGO_SETTINGS_MODULE\', \'<%= projectName %>.spec.stage.settings\')\n\n\
from <%= projectName %>.wsgi import application\n', this));

  // spec/prod
  this.write(specDir + '/prod/__init__.py', '');

  this.write(specDir + '/prod/settings.py', this.engine('\
# -*- coding: utf-8 -*-\n\
from <%= projectName %>.settings import *\n\
from <%= projectName %>.spec.prod.secret import SECRET_KEY, ALLOWED_HOSTS, DEFAULT_DATABASE_SETTING\n\n\
DATABASES[\'default\'] = DEFAULT_DATABASE_SETTING\n\n\
DEBUG = False\n\n\
TEMPLATE_DEBUG = False\n\n\
WSGI_APPLICATION = \'<%= projectName %>.spec.prod.wsgi.application\'\n', this));

  this.write(specDir + '/prod/wsgi.py', this.engine('\
# -*- coding: utf-8 -*-\n\
import os\n\
os.environ.setdefault(\'DJANGO_SETTINGS_MODULE\', \'<%= projectName %>.spec.prod.settings\')\n\n\
from <%= projectName %>.wsgi import application\n', this));

  // spec/local
  this.write(specDir + '/local/__init__.py', '');

  // apps
  var appsDir = this.projectName + '/apps';
  this.write(appsDir + '/__init__.py', '');

  // common
  var commonDir = this.projectName + '/common';
  this.write(commonDir + '/__init__.py', '');
  this.write(
    commonDir + '/trans.py',
    '\
# -*- coding: utf-8 -*-\n\
# Put the string you want to manually translate in this file, like this:\n\
#\n\
# _(\'Something that is not translated in offcial Django distro.\')\n\
#\n\
# When you run `django-admin.py makemessage -l <language-code>` command, it will create a message file:\n\
#\n\
# locale/<language-code>/LC_MESSAGES/django.po\n\
#\n\
# For more information about translation, see:\n\
# https://docs.djangoproject.com/en/dev/topics/i18n/translation/\n\
from django.utils.translation import ugettext_lazy as _\n\n'
  );
  this.write(commonDir + '/management/__init__.py', '');
  this.write(commonDir + '/management/commands/__init__.py', '');
  this.write(commonDir + '/templatetags/__init__.py', '');
  this.write(commonDir + '/test/__init__.py', '')
  this.mkdir(commonDir + '/templates');
  this.mkdir(commonDir + '/static');

  // utils
  var utilsDir = this.projectName + '/utils';
  this.write(utilsDir + '/__init__.py', '');
};

AppGenerator.prototype.djangoDirRequirements = function djangoDirRequirements() {
  this.write('requirements/common.txt', '# This file contains common Python dependencies for all circumstances.\n');
  this.write('requirements/stage.txt', '# This file contains Python dependencies for the staging server.\n-r common.txt\n');
  this.write('requirements/prod.txt', '# This file contains Python dependencies for the production server.\n-r common.txt\n');
  this.write('requirements/dev.txt', '# This file contains Python dependencies for development only.\n');
};

AppGenerator.prototype.djangoDirFabric = function djangoDirFabric() {
  this.write('fabfile/__init__.py', '');
  this.write('fabfile/build.py', '');
  this.write('fabfile/deploy/__init__.py', '');
  this.write('fabfile/deploy/stage.py', '');
  this.write('fabfile/deploy/prod.py', '');
};

AppGenerator.prototype.djangoDirReferences = function djangoDirReferences() {
  this.mkdir('references');
  this.mkdir('references/conf/stage');
  this.mkdir('references/conf/stage/uwsgi');
  this.mkdir('references/conf/stage/ngix');
  this.mkdir('references/conf/prod');
  this.mkdir('references/conf/prod/uwsgi');
  this.mkdir('references/conf/prod/ngix');
  this.mkdir('references/docs');
};

AppGenerator.prototype.djangoDirEtc = function djangoDirEtc() {
  this.mkdir('etc');
  this.mkdir('etc/static');
  this.mkdir('etc/static/styles');
  if (this.includeLess) {
    this.mkdir('etc/static/less');
    this.mkdir('etc/static/lib-less');
  }
  this.mkdir('etc/static/scripts');
  this.mkdir('etc/static/images');
  this.mkdir('etc/static/fonts');
  this.mkdir('etc/templates');
  this.mkdir('etc/uploads');
  this.mkdir('etc/test');
};

AppGenerator.prototype.djangoSettings = function djangoSettings() {
  if (!this.hasSettings) {
    console.warn(chalk.orange('Warning: `%s/settings.py` file not found. You must manually edit STATICFILES_DIRS, TEMPLATE_DIRS and MEDIA_ROOT of project settings.'), this.projectName);
    return;
  }

  // Modify settings.py
  var settings_file = this.projectName + '/settings.py';
  var settings_body = this.readFileAsString(settings_file);
  if (settings_body.indexOf('import os') < 0) {
    settings_body = settings_body + '\nimport os\n';
  }

  if (settings_body.indexOf('BASE_DIR') < 0) {
    settings_body = settings_body + '\nBASE_DIR = os.path.dirname(os.path.dirname(__file__))\n';
  }

  if (settings_body.indexOf('STATIC_ROOT') < 0) {
    settings_body = settings_body + '\n# https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-STATIC_ROOT\nSTATIC_ROOT = os.path.join(BASE_DIR, \'etc/static_collected\')\n';
  }

  if (settings_body.indexOf('STATICFILES_DIRS') < 0) {
    settings_body = settings_body + '\nSTATICFILES_DIRS = (\n    os.path.join(BASE_DIR, \'etc/static\'),\n)\n';
  }

  if (settings_body.indexOf('TEMPLATE_DIRS') < 0) {
    settings_body = settings_body + '\nTEMPLATE_DIRS = (\n    os.path.join(BASE_DIR, \'etc/templates\'),\n)\n';
  }

  if (settings_body.indexOf('MEDIA_ROOT') < 0) {
    settings_body = settings_body + '\nMEDIA_ROOT = os.path.join(BASE_DIR, \'etc/uploads\')\n';
  }

  fs.writeFile(settings_file, settings_body, function (err) {
    if (err) throw err;
  });
};

AppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js', 'etc/Gruntfile.js');
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'etc/package.json');
};

AppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', 'etc/.bowerrc');
  this.copy('_bower.json', 'etc/bower.json');
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', 'etc/.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', 'etc/.editorconfig');
};

AppGenerator.prototype.h5bp = function h5bp() {
  this.copy('404.html', 'etc/templates/404.html');
  this.copy('favicon.ico', 'etc/static/favicon.ico');
  this.copy('robots.txt', 'etc/static/robots.txt');
  this.copy('htaccess', 'etc/static/.htaccess');
};

AppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  var css = 'main.' + (this.includeCompass ? 's' : '') + 'css';
  this.copy(css, 'etc/static/styles/' + css);
};

AppGenerator.prototype.writeIndex = function writeIndex() {

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.indexFile = this.engine(this.indexFile, this);

  if (this.includeRequireJS) {
    this.copy('index2.html', 'etc/templates/index2.html');
    this.copy('infra.js', 'etc/static/scripts/infra.js');
    this.copy('main.js', 'etc/static/scripts/main.js');
    this.copy('main2.js', 'etc/static/scripts/main2.js');
  }
  else {
    // No RequireJS
    // wire Bootstrap plugins
    if (this.includeBootstrap) {
      var bs = '../bower_components/bootstrap' + (this.includeCompass ? '-sass-official/vendor/assets/javascripts/bootstrap/' : '/js/');
      this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
        bs + 'affix.js',
        bs + 'alert.js',
        bs + 'dropdown.js',
        bs + 'tooltip.js',
        bs + 'modal.js',
        bs + 'transition.js',
        bs + 'button.js',
        bs + 'popover.js',
        bs + 'carousel.js',
        bs + 'scrollspy.js',
        bs + 'collapse.js',
        bs + 'tab.js'
      ]);
    }

    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: 'scripts/main.js',
      sourceFileList: ['{{ STATIC_URL }}scripts/main.js'],
      searchPath: '{app,.tmp}'
    });
  }
};

AppGenerator.prototype.app = function app() {
  this.write('etc/templates/index.html', this.indexFile);

  if (!this.includeRequireJS) {
    if (this.coffee) {
      this.write(
        'etc/static/scripts/main.coffee',
        'console.log "\'Allo from CoffeeScript!"'
      );
    }
    else {
      this.write('etc/static/scripts/main.js', 'console.log(\'\\\'Allo \\\'Allo!\');');
    }
  }
};

AppGenerator.prototype.readme = function readme() {
  this.template('README.txt');
};

AppGenerator.prototype.chdir = function chdir() {
  process.chdir('etc');
};

AppGenerator.prototype.install = function () {
  if (this.options['skip-install']) {
    return;
  }

  var done = this.async();
  this.installDependencies({
    skipMessage: this.options['skip-install-message'],
    skipInstall: this.options['skip-install'],
    callback: done
  });
};

AppGenerator.prototype.notice = function () {
  console.log(chalk.magenta('\nNotice: Please run `cd etc`, then run `grunt` to build static assets.\n'));
}
