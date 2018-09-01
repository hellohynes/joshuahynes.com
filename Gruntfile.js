'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Shell commands for use in Grunt tasks
        shell: {
            jekyllBuild: {
                command: 'bundle exec jekyll build'
            },
            jekyllServe: {
                command: 'bundle exec jekyll serve'
            }
        },
        // Less compilation
        less: {
            production: {
                files: {
                    'assets/css/site.css': 'assets/less/site.less'
                }
            }
        },
        // Minify our compiled CSS
        cssmin: {
            production: {
                files: {
                    'assets/css/site.min.css': 'assets/css/site.css'
                }
            }
        },
        // Watch for files to change and run tasks when they do
        watch: {
            less: {
                files: ['assets/less/**/*.less'],
                tasks: ['less:production']
            },
            css: {
                files: ['assets/css/site.css'],
                tasks: ['cssmin']
            }
        },
        // Run tasks in parallel
        concurrent: {
            serve: [
                'less:production',
                'watch:less',
                'cssmin',
                'watch:css',
                'shell:jekyllServe',
            ],
            options: {
                logConcurrentOutput: true
            }
        },
        // Clean the icons directory to prepare for copying from the node dependency
        clean: {
            icons: ['assets/icons/']
        },
        // Copy files out of node_modules so Jekyll can use them
        copy: {
            svgs: {
                expand: true,
                cwd: 'node_modules/@stackoverflow/stacks-icons/build/lib',
                src: '**',
                dest: 'assets/icons/',
                filter: 'isFile',
            },
            stacks: {
                expand: true,
                cwd: 'node_modules/@stackoverflow/stacks/lib/src',
                src: '**',
                dest: 'assets/less/stacks/',
                filter: 'isFile',
            },
            data: {
                expand: true,
                cwd: 'node_modules/@stackoverflow/stacks-icons/build',
                src: 'icons.yml',
                dest: '_data/',
                filter: 'isFile',
            },
        },
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task
    grunt.registerTask('default', ['concurrent:serve']);
    grunt.registerTask('build', ['less:production', 'less:partials', 'clean:partials', 'cssmin']);
};
