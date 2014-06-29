(function () {
  'use strict';
  module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      qunit: {
        all: {
          timeout: 50000,
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
    grunt.registerTask('default', 'lint qunit concat min');

    // Travis CI task.
    grunt.registerTask('travis', ['jshint', 'qunit']);
  };
}());
