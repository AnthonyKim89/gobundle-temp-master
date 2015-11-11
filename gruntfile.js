module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            jade: {
                files: ['app/views/**'],
                options: {
                    livereload: true,
                },
            },
            js: {
                files: ['public/js/**', 'app/**/*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true,
                },
            },
            pages: {
                files: ['public/pages/**'],
                tasks: ['jshint'],
                options: {
                    livereload: true,
                },
            },
            css: {
                files: ['public/css/*.less'],
                options: {
                    livereload: true
                },
                tasks: ['less']
            }
        },
        less: {
            development: {
                 options: {
                     paths: ["public/css/"]
                 },
                 files: {"public/css/main.css": "public/css/main.less", "public/css/font.css": "public/css/font.less"}
            },
            production: {
                 options: {
                     paths: ["public/css"]/*,
                     cleancss: true*/
                 },
                 files: {"public/css/main.css": "public/css/main.less", "public/css/font.css": "public/css/font.less"}
            }
        },
        jshint: {
            all: ['gruntfile.js', 'public/js/**/*.js', 'test/mocha/**/*.js', 'test/karma/**/*.js', 'app/**/*.js']
        },
        nodemon: {
            dev: {
                script: 'app.js',
                options: {
                    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
                    ext: 'js',
                    watch: ['app', 'config'],
                    delayTime: 1,
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        },
        mochaTest: {
            options: {
                reporter: 'spec'
            },
            src: ['test/mocha/**/*.js']
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma/karma.conf.js'
            }
        },
        forever: {
          server: {
            options: {
              index: 'app.js',
              logDir: 'logs'
            }
          }
        }
    });

    //Load NPM tasks 
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-copy');
    grunt.loadNpmTasks('grunt-forever');
    grunt.loadNpmTasks('grunt-contrib-less');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).
    grunt.registerTask('default', ['jshint', 'less', 'concurrent']);

    //Test task.
    grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);
};