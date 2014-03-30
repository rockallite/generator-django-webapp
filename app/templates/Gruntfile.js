// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    <% if (includeRequireJS) { %>// ReuireJS configuration for distribution
    var requirejsDistModules = [
        {
            name: 'main',
            exclude: ['infra']
        }, {
            name: 'main2',
            exclude: ['infra']
        }, {
            name: 'infra'
        }
    ];

    <% } %>// Define the configuration for all the tasks
    grunt.initConfig({

        // Configurable paths
        config: {
            assets: 'static',
            templates: 'templates',
            dist: 'dist',
            distAssets: 'dist/static',
            distTemplates: 'dist/templates'
        },

        <% if (includeRequireJS) { %>// Optimize RequireJS projects using r.js
        requirejs: {
            dist: {
                // https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    baseUrl: '<%%= config.assets %>/scripts',
                    dir: '<%%= config.distAssets %>/scripts',
                    paths: {
                        jquery: '../bower_components/jquery/dist/jquery',
                        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap'
                    },
                    shim: {
                        bootstrap: ['jquery'],
                    },
                    modules: requirejsDistModules,
                    optimize: 'uglify',
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true,
                    removeCombined: true,
                    findNestedDependencies: true
                }
            }
        },

        // Custom task to collect information of revved files of RequireJS modules,
        // then write a temporary file for inserting into html body for paths config
        requirejspaths: {
            dist: {
                options: {
                    baseRoot: '<%%= config.distAssets %>/scripts',
                    baseUrl: '{{ STATIC_URL }}scripts',
                    modules: requirejsDistModules.map(function(m) {return m.name;}),
                    outputFile: '.tmp/requirejspaths.html'
                }
            }
        },

        // Process html files at build time to modify them depending on the release environment
        processhtml: {
            options: {
                commentMarker: 'process',
                includeBase: '.tmp',
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= config.templates %>',
                    src: '{,*/}*.html',
                    dest: '<%%= config.distTemplates %>'
                }]
            }
        },

        <% } %>// Watches files for changes and runs tasks based on the changed files
        watch: {
            // bower: {
            //     files: ['bower.json'],
            //     tasks: ['bowerInstall']
            // },
            <% if (coffee) { %>
            coffee: {
                files: ['<%%= config.assets %>/scripts/{,*/}*.{coffee,litcoffee,coffee.md}'],
                tasks: ['coffee:dist']
            },
            coffeeTest: {
                files: ['test/spec/{,*/}*.{coffee,litcoffee,coffee.md}'],
                tasks: ['coffee:test', 'test:watch']
            },<% } else { %>
            js: {
                files: ['<%%= config.assets %>/scripts/{,*/}*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            jstest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['test:watch']
            },<% } %>
            gruntfile: {
                files: ['Gruntfile.js']
            },<% if (includeCompass) { %>
            compass: {
                files: ['<%%= config.assets %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'autoprefixer']
            },<% } %><% if (includeLess) { %>
            less: {
                files: ['<%%= config.assets %>/less/{,*/}*.less'],
                tasks: ['less']
            },<% } %>
            styles: {
                files: ['<%%= config.assets %>/styles/{,*/}*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },
            livereload: {
                options: {
                    livereload: '<%%= connect.options.livereload %>'
                },
                files: [
                    '<%%= config.templates %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',<% if (coffee) { %>
                    '.tmp/scripts/{,*/}*.js',<% } %>
                    '<%%= config.assets %>/images/{,*/}*'
                ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                open: true,
                livereload: 35729,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use('/bower_components', connect.static('<%%= config.assets %>/bower_components')),
                            connect.static('<%%= config.assets %>')
                        ];
                    }
                }
            },
            test: {
                options: {
                    open: false,
                    port: 9001,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect.static('test'),
                            connect().use('/bower_components', connect.static('<%%= config.assets %>/bower_components')),
                            connect.static('<%%= config.assets %>')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    base: [
                        '<%%= config.distAssets %>',
                        '<%%= config.distTemplates %>'
                    ],
                    livereload: false
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%%= config.dist %>/*',
                        '!<%%= config.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'<% if (includeRequireJS) { %>,
            requirejs: '<%%= config.distAssets %>/scripts/build.txt'<% } %>
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%%= config.assets %>/scripts/{,*/}*.js',
                '!<%%= config.assets %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },<% if (testFramework === 'mocha') { %>

        // Mocha testing framework configuration options
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/index.html']
                }
            }
        },<% } else if (testFramework === 'jasmine') { %>

        // Jasmine testing framework configuration options
        jasmine: {
            all: {
                options: {
                    specs: 'test/spec/{,*/}*.js'
                }
            }
        },<% } %><% if (coffee) { %>

        // Compiles CoffeeScript to JavaScript
        coffee: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= config.assets %>/scripts',
                    src: '{,*/}*.{coffee,litcoffee,coffee.md}',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '{,*/}*.{coffee,litcoffee,coffee.md}',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },<% } %><% if (includeCompass) { %>

        // Compiles Sass to CSS and generates necessary files if requested
        compass: {
            options: {
                sassDir: '<%%= config.assets %>/styles',
                cssDir: '.tmp/styles',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: '<%%= config.assets %>/images',
                javascriptsDir: '<%%= config.assets %>/scripts',
                fontsDir: '<%%= config.assets %>/fonts',
                importPath: '<%%= config.assets %>/bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/fonts',
                relativeAssets: false,
                assetCacheBuster: false
            },
            dist: {
                options: {
                    generatedImagesDir: '<%%= config.distAssets %>/images/generated'
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },<% } %><% if (includeLess) { %>
        
        // Compile LESS files to CSS.
        less: {
            compile: {
                options: {
                    strictMath: true,
                },
                files: [{
                    // Dynamic expansion:
                    // http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically
                    expand: true,
                    cwd: '<%%= config.assets %>/less',
                    src: ['{,*/}*.less'],
                    dest: '.tmp/styles/',
                    ext: '.css'
                }]
            }
        },<% } %>

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['> 1%', 'last 2 versions']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        // Automatically inject Bower components into the HTML file
        // bowerInstall: {
        //     app: {
        //         src: ['<%%= config.templates %>/index.html'],
        //         ignorePath: '<%%= config.assets %>/',<% if (includeCompass) { %>
        //         exclude: ['<%%= config.assets %>/bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap.js']<% } else { %>
        //         exclude: ['<%%= config.assets %>/bower_components/bootstrap/dist/js/bootstrap.js']<% } %>
        //     }<% if (includeCompass) { %>,
        //     sass: {
        //         src: ['<%%= config.assets %>/styles/{,*/}*.{scss,sass}'],
        //         ignorePath: '<%%= config.assets %>/bower_components/'
        //     }<% } %>
        // },

        // Renames files for browser caching purposes
        filerev: {
            files: {
                src: [
                    '<%%= config.distAssets %>/scripts/{,*/}*.js',
                    '<%%= config.distAssets %>/styles/{,*/}*.css',
                    '<%%= config.distAssets %>/images/{,*/}*.*',
                    '<%%= config.distAssets %>/fonts/{,*/}*.*'
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                root: '<%%= config.assets %>',
                dest: '<%%= config.distAssets %>',
                useDjangoFlow: true
            },
            html: '<%%= config.templates %>/{,*/}*.html'
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: [
                    '<%%= config.distAssets %>',
                    '<%%= config.distAssets %>/styles'
                ],
                useDjangoPatterns: true
            },
            html: ['<%%= config.distTemplates %>/{,*/}*.html'],
            css: ['<%%= config.distAssets %>/styles/{,*/}*.css']
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= config.assets %>/images',
                    src: '{,*/}*.{gif,jpeg,jpg,png}',
                    dest: '<%%= config.distAssets %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= config.assets %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%%= config.distAssets %>/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeCommentsFromCDATA: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: false,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyCSSOptions: {
                        keepURLWhitespaces: true
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%%= config.distTemplates %>',
                    src: '{,*/}*.html',
                    dest: '<%%= config.distTemplates %>'
                }]
            }
        },

        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //     dist: {
        //         files: {
        //             '<%%= config.distAssets %>/styles/main.css': [
        //                 '.tmp/styles/{,*/}*.css',
        //                 '<%%= config.assets %>/styles/{,*/}*.css'
        //             ]
        //         }
        //     }
        // },
        // uglify: {
        //     dist: {
        //         files: {
        //             '<%%= config.distAssets %>/scripts/scripts.js': [
        //                 '<%%= config.assets %>/scripts/scripts.js'
        //             ]
        //         }
        //     }
        // },
        // concat: {
        //     dist: {}
        // },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    // Static assets
                    expand: true,
                    dot: true,
                    cwd: '<%%= config.assets %>',
                    dest: '<%%= config.distAssets %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/{,*/}*.webp',
                        'fonts/{,*/}*.*'
                    ]
                }, {
                    // Template files
                    expand: true,
                    dot: true,
                    cwd: '<%%= config.templates %>',
                    dest: '<%%= config.distTemplates %>',
                    src: ['{,*/}*.html']
                }<% if (includeBootstrap) { %>, {
                    // Bootstrap
                    expand: true,
                    dot: true,<% if (includeCompass) { %>
                    cwd: '.',
                    src: ['<%%= config.assets %>bower_components/bootstrap-sass-official/vendor/assets/fonts/bootstrap/*.*'],<% } else { %>
                    cwd: '<%%= config.assets %>bower_components/bootstrap/dist',
                    src: ['fonts/*.*'],<% } %>
                    dest: '<%%= config.distAssets %>'
                }<% } %>]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%%= config.assets %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },<% if (includeModernizr) { %>

        // Generates a custom Modernizr build that includes only the tests you
        // reference in your app
        modernizr: {
            devFile: '<%%= config.assets %>/bower_components/modernizr/modernizr.js',
            outputFile: '<%%= config.distAssets %>/scripts/vendor/modernizr.js',
            files: [
                '<%%= config.distAssets %>/scripts/{,*/}*.js',
                '<%%= config.distAssets %>/styles/{,*/}*.css',
                '!<%%= config.distAssets %>/scripts/vendor/*'
            ],
            uglify: true
        },<% } %>

        // Run some tasks in parallel to speed up build process
        concurrent: {
            server: [<% if (includeCompass) { %>
                'compass:server',<% } %><% if (includeLess) { %>
                'less',<% } %><% if (coffee) { %>
                'coffee:dist',<% } %>
                'copy:styles'
            ],
            test: [<% if (coffee) { %>
                'coffee',<% } %>
                'copy:styles'
            ],
            dist: [<% if (coffee) { %>
                'coffee',<% } %><% if (includeCompass) { %>
                'compass',<% } %><% if (includeLess) { %>
                'less',<% } %>
                'copy:styles',
                'imagemin',
                'svgmin'
            ]
        }
    });


    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run([target ? ('serve:' + target) : 'serve']);
    });

    grunt.registerTask('test', function (target) {
        if (target !== 'watch') {
            grunt.task.run([
                'clean:server',
                'concurrent:test',
                'autoprefixer'
            ]);
        }

        grunt.task.run([
            'connect:test',<% if (testFramework === 'mocha') { %>
            'mocha'<% } else if (testFramework === 'jasmine') { %>
            'jasmine'<% } %>
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',<% if (includeRequireJS) { %>
        'requirejs',
        'clean:requirejs',<% } %>
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'cssmin',
        'uglify',
        'copy:dist',<% if (includeModernizr) { %>
        'modernizr',<% } %>
        'filerev',<% if (includeRequireJS) { %>
        'requirejspaths',
        'processhtml',<% } %>
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};
