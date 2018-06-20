'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Shell commands for use in Grunt tasks
        shell: {
            jekyllBuild: {
                command: 'jekyll build',
                options: {
                    stderr: false,
                    // execOptions: {
                    //     cwd: 'docs'
                    // }
                }
            },
            jekyllServe: {
                command: 'jekyll serve',
                options: {
                    stderr: false,
                    // execOptions: {
                    //     cwd: 'docs'
                    // }
                }
            }
        },
        // Less compilation
        less: {
            production: {
                files: {
                    'assets/css/site.css': 'assets/less/site.less'
                }
            },
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
            postcss: {
                files: ['assets/less/*.less'],
                tasks: ['postcss:autoprefixing','postcss:sorting'],
            },
            less: {
                files: ['assets/less/*.less'],
                tasks: ['less']
            },
            css: {
                files: ['assets/css/site.css'],
                tasks: ['cssmin']
            }
        },
        // Run tasks in parallel
        concurrent: {
            serve: [
                'postcss:autoprefixing',
                'postcss:sorting',
                'watch:postcss',
                'less',
                'watch:less',
                'cssmin',
                'watch:css',
                'shell:jekyllServe',
            ],
            options: {
                logConcurrentOutput: true
            }
        },
        postcss: {
            // Add sorting directly to Less files
            sorting: {
                options: {
                    syntax: require('postcss-less'),
                    processors: [
                        require('postcss-sorting')({
                            'properties-order': [
                                'content',
                                'box-sizing',
                                'display',
                                'visibility',
                                'position',
                                'float',
                                'clear',
                                'box-direction',
                                'box-orient',
                                'flex-direction',
                                'box-ordinal-group',
                                'flex-order',
                                'order',
                                'box-flex',
                                'flex',
                                'flex-grow',
                                'flex-wrap',
                                'flex-shrink',
                                'flex-flow',
                                'flex-preferred-size',
                                'flex-basis',
                                'box-pack',
                                'flex-pack',
                                'justify-content',
                                'flex-line-pack',
                                'align-content',
                                'box-align',
                                'flex-align',
                                'align-items',
                                'flex-item-align',
                                'align-self',
                                'top',
                                'right',
                                'bottom',
                                'left',
                                'width',
                                'height',
                                'min-width',
                                'min-height',
                                'max-width',
                                'max-height',
                                'overflow',
                                'overflow-x',
                                'overflow-y',
                                'margin',
                                'margin-top',
                                'margin-right',
                                'margin-bottom',
                                'margin-left',
                                'padding',
                                'padding-top',
                                'padding-right',
                                'padding-bottom',
                                'padding-left',
                                'z-index',
                                'clip-path',
                                'opacity',
                                'border-collapse',
                                'border-spacing',
                                'border',
                                'border-color',
                                'border-top-color',
                                'border-right-color',
                                'border-bottom-color',
                                'border-left-color',
                                'border-style',
                                'border-top-style',
                                'border-right-style',
                                'border-bottom-style',
                                'border-left-style',
                                'border-width',
                                'border-top-width',
                                'border-right-width',
                                'border-bottom-width',
                                'border-left-width',
                                'border-top',
                                'border-right',
                                'border-bottom',
                                'border-left',
                                'border-radius',
                                'border-top-left-radius',
                                'border-top-right-radius',
                                'border-bottom-left-radius',
                                'border-bottom-right-radius',
                                'outline',
                                'background',
                                'background-color',
                                'background-repeat',
                                'background-size',
                                'box-shadow',
                                'color',
                                'font',
                                'font-family',
                                'font-size',
                                'font-weight',
                                'font-style',
                                'text-align',
                                'text-transform',
                                'text-decoration',
                                'text-overflow',
                                'line-height',
                                'list-style',
                                'list-style-type',
                                'list-style-image',
                                'list-style-position',
                                'vertical-align',
                                'white-space',
                                'word-wrap',
                                'backface-visibility',
                                'animation',
                                'transform',
                                'transform-origin',
                                'transition',
                                'transition-delay',
                                'transition-duration',
                                'transition-property',
                                'transition-timing-function',
                                'will-change',
                                'touch-action',
                                'pointer-events',
                                'touch-callout',
                                'user-select',
                                'cursor',
                            ],
                            'unspecified-properties-position': 'bottom',
                        }),
                    ]
                },
                src: 'assets/less/*.less',
            },
            autoprefixing: {
                options: {
                    syntax: require('postcss-less'),
                    processors: [
                        require('autoprefixer')({
                            browsers: 'last 2 versions'
                        }),
                    ]
                },
                src: 'assets/less/*.less',
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-postcss');

    // Default task
    grunt.registerTask('default', ['concurrent:serve']);
    grunt.registerTask('build', ['less', 'cssmin']);
    grunt.registerTask('process-css', ['postcss']);
};
