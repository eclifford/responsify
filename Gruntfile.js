module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('bower.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= pkg.authors[0] %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      dist: {
        files: {
          'responsify.min.js': ['responsify.js']
        }
      }
    },
    jshint: {
      all: ['responsify.js']
    },
    watch: {
      files: ['responsify.js', 'test/**/*.js'],
      tasks: ['jshint', 'karma:unit:run']
    },
    karma: {
      options: {
        reporters: ['progress', 'coverage'],
        frameworks: ['mocha', 'chai', 'jquery-2.1.0', 'sinon-chai'],

        files: [
          'responsify.js',
          'bower_components/MutationObserver-shim/MutationObserver.js',
          'test/unit/**/*.js',
          'test/fixtures/**/*.html'
        ],

        preprocessors: {
          'responsify.js': ['coverage']
        },

        // optionally, configure the reporter
        coverageReporter: {
          type : 'html',
          dir : 'test/coverage/'
        }
      },
      unit: {
        browsers: ['PhantomJS']
      },
      single: {
        browsers: ['PhantomJS'],
        singleRun: true
      }
    },
    replace: {
      dist: {
        src: ['responsify.js'],
        overwrite: true,
        replacements: [{
          from: /version:.'[0-9]+.[0-9]+.[0-9]+'/g,
          to: "version: '<%= pkg.version %>'"
        }]
      }
    },
    bump: {
      files: ['package.json', 'bower.json']
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('build', ['jshint', 'bump', 'replace', 'uglify']);

};
