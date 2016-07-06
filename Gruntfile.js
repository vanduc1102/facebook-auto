// Generated on 2014-05-12 using generator-angular 0.8.0
'use strict';
module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);
    // Define the configuration for all the tasks
	grunt.loadNpmTasks('grunt-json-minify');
    grunt.initConfig({

        // Project settings
        yeoman: {
            app: 'source',
            dist: 'dist'
        },
        // Empties folders to start fresh
        clean: {
            dist: {
                src:'<%= yeoman.dist %>'
            }
        },
		cssmin: {
			minify: {
				expand: true,
				cwd: '<%= yeoman.app %>',
				src: ['**/*.css', '!*.min.css'],
				dest: '<%= yeoman.dist %>',
				ext: '.css'
			}
		},
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true,
					minifyCSS:true
                },
                files:{
					'<%= yeoman.dist %>/options.html':'<%= yeoman.app %>/options.html'
                }
            }
        },
		uglify: {
			my_target: {
			  files: [{
				  expand: true,
				  cwd: '<%= yeoman.app %>',
				  src: '**/*.js',
				  dest: '<%= yeoman.dist %>'
				}]
			}
		},
		copy: {
            assets: {
                expand: true,
                cwd: '<%= yeoman.app %>/assets',
                dest: '<%= yeoman.dist %>/assets',
                src: '{,*/}*.*'
            },
			json: {
                expand: true,
                cwd: '<%= yeoman.app %>',
                dest: '<%= yeoman.dist %>',
                src: '**/*.json'
            }
        },
		'json-minify': {
			build: {
				files: '<%= yeoman.dist %>/**/*.json'
			}
		}
    });

    grunt.registerTask('build', [
        'clean:dist',
		'copy:assets',
		'copy:json',
		'cssmin',
        'htmlmin',
		'uglify',
		'json-minify'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
