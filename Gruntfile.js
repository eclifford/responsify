module.exports = function(grunt) {
  grunt.initConfig({
    // pkg: grunt.file.readJSON('bower.json'),
    // uglify: {
    //   options: {
    //     banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
    //       '<%= pkg.authors[0] %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
    //   },
    //   dist: {
    //     files: {
    //       'bronson.min.js': ['bronson.js']
    //     }
    //   }
    // },
    // jshint: {
    //   options: {
    //     loopfunc: true,
    //     '-W058': true
    //   },
    //   all: ['Gruntfile.js', 'bronson.js']
    // },
    // watch: {
    //   files: ['Gruntfile.js', 'bronson.js', 'test/**/*.js'],
    //   tasks: ['jshint', 'karma:unit:run']
    // },
    // copy: {
    //   bronson: {
    //     src: 'bronson.js',
    //     dest: 'demo/app/vendor/bronson.js'
    //   }
    // },
    karma: {
      options: {
        frameworks: ['mocha', 'chai', 'sinon-chai', 'jquery-2.1.0'],

        files: [
          'responsive.js',
          'bower_components/MutationObserver-shim/MutationObserver.js',
          'test/**/*'
        ]
      },
      unit: {
        browsers: ['PhantomJS']
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

  // grunt.registerTask('default', ['karma:unit:start', 'watch']);
  // grunt.registerTask('build', ['jshint', 'uglify']);
  // grunt.registerTask('deploy', ['replace', 'build', 'release']);
};
