About directory structure:

<%= projectName %>
  |= fabfile    <-- Fabric runtime files
  |= requirements    <-- Python virtualenv requirements
  |
  |= references
  |   |= conf    <-- Server related configuration files
  |   \= docs    <-- Docs about the project
  |
  |= etc    <-- Mostly front-end files.
  |   |= test    <--  Javascript unit tests.
  |   |= static    <-- Project-wise static files. Contains styles, scripts, images, fonts sub-directories
  |   |= templates    <-- Project-wise Django templates
  |   \= uploads    <-- User-uploaded content (`MEDIA_ROOT`). Keep it out of Git
  |
  \= <%= projectName %>
      |= spec    <-- Environment-specific Django settings and WSGI applications
      |= my    <-- Custom project information. See below for details
      |= common    <-- A special app which injects project-wise functionalities. See below for details
      |= apps    <-- Apps created by you (Run `django-admin.py startapp <your_app_name>` here)
      \= utils    <-- Utilities modules written by you



Details of some directories:

<%= projectName %>/<%= projectName %>/my/

  This directory holds project information which should be kept out of a cooperative repo, e.g. the production SECRET_KEY, or local development settings file. However, you can version-control this directory by committing it into an independent private repo.

  These files are for soft-linking in other places. Also, keep the symbolic links out of Git.


<%= projectName %>/<%= projectName %>/common/

  This directory holds a special Django app which injects project-wise functionalities written by you.

  Common usage:

  * Management commands
  * Template tags
  * Templates for overriding other apps (such as the `admin` app)
  * Static contents for overriding other apps (such as the `admin` app)
  * Contributed translations (via a python file which contains strings to be translated, e.g. trans.py)
  * Project wise unit tests

  Put this app in the first element of INSTALLED_APPS so that it takes priority for processing, like this:

	INSTALLED_APPS = (
	    '<%= projectName %>.common',  # <-- Put it here to override `admin` app's template and static files
	    'django.contrib.admin',
	    'django.contrib.auth',
	    ...
	)
