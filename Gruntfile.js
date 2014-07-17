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
        frameworks: ['mocha', 'chai', 'sinon-chai', 'jquery-2.1.0'],

        files: [
          'responsify.js',
          'bower_components/MutationObserver-shim/MutationObserver.js',
          'test/**/*'
        ]
      },
      unit: {
        browsers: ['PhantomJS']
      },
      single: {
        browsers: ['PhantomJS'],
        singleRun: true
      }
    }
    // bump: {
    //   options: {
    //     files: ['package.json', 'bower.json'],
    //     commit: false,
    //     createTag: false,
    //     push: false
    //   }
    // },
    // release: {
    //   options: {
    //     file: '--all',
    //     npm: false,
    //     bump: true,
    //     github: {
    //       repo: 'eclifford/bronson',
    //       usernameVar: 'GITHUB_USERNAME',
    //       passwordVar: 'GITHUB_PASSWORD'
    //     }
    //   }
    // },
    // replace: {
    //   dist: {
    //     src: ['bronson.js'],
    //     overwrite: true,
    //     replacements: [{
    //       from: /version:.'[0-9]+.[0-9]+.[0-9]+'/g,
    //       to: "version: '<%= pkg.version %>'"
    //     }]
    //   }
    // }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // grunt.registerTask('default', ['karma:unit:start', 'watch']);
  // grunt.registerTask('build', ['jshint', 'uglify']);
  // grunt.registerTask('deploy', ['replace', 'build', 'release']);
};
