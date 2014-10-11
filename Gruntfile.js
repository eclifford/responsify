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
        frameworks: ['mocha', 'chai', 'jquery-2.1.0', 'sinon-chai'],

        files: [
          'bower_components/MutationObserver-shim/MutationObserver.js',
          'responsify.js',
          'test/unit/**/*.js',
          'test/fixtures/**/*.html'
        ],

        preprocessors: {
          'responsify.js': ['coverage']
        }

      },
      unit: {
        reporters: ['progress', 'coverage'],
        browsers: ['PhantomJS'],
        coverageReporter: {
          type : 'html',
          dir : 'test/coverage/'
        }
      },
      ci: {
        reporters: ['progress', 'coverage', 'coveralls'],
        browsers: ['PhantomJS'],
        coverageReporter: {
          type : 'lcov',
          dir : 'test/coverage/'
        },
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
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: ['pkg'],
        commit: false,
        createTag: false,
        push: false,
        commitFiles: ['-a']
      }
    },
    changelog: {
      default: {
        options: {}
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('release', 'Build and release plugin', function(type) {
    grunt.task.run([
      "jshint",
      "bump-only:" + type || "patch",
      "replace",
      "uglify",
      "changelog",
      "bump-commit"
    ]);
  });
};
