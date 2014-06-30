(function () {
  'use strict';
  module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      banner: '/*!\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        '<%= pkg.description ? " *\\n * " + pkg.description + "\\n" : "" %>' +
        ' * Licensed <%= pkg.license %>\n */\n',
      clean: {
        src: ['dist']
      },
      concat: {
        options: {
          banner: '<%= banner %>',
          stripBanners: true
        },
        dist: {
          src: ['src/local-storage-wrapper.js', 'src/local-storage-cache.js'],
          dest: 'dist/local-storage-expirable.js'
        }
      },
      uglify: {
        options: {
          banner: '<%= banner %>'
        },
        dist: {
          src: '<%= concat.dist.dest %>',
          dest: 'dist/local-storage-expirable.min.js'
        }
      },
      qunit: {
        all: {
          src: ['test/**/*.html']
        }
      },
      jshint: {
        // Define the files to lint
        files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
        options: {
          jshintrc: true,
          // more options here if you want to override JSHint defaults
          globals: {
            EventEmitter: true,
            console: true,
            module: true
          }
        }
      },
      watch: {
        files: ['<%= jshint.files %>'],
        tasks: ['jshint', 'qunit']
      }
    });

    // Default task.
    grunt.registerTask('default', ['clean', 'concat', 'uglify']);

    // Travis CI task.
    grunt.registerTask('travis', ['jshint', 'qunit']);
  };
}());
