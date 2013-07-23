module.exports = (grunt) ->
  grunt.initConfig {

    # compile coffeescript files
    coffee:
      compile:
        files:
          'jquery.immytypeahead.js': 'jquery.immytypeahead.coffee'
          'knockout-immytypeahead.js': 'knockout-immytypeahead.coffee'

    # compile less files
    less:
      app:
        options:
          compress: true
        files:
          'immytypeahead.css': 'immytypeahead.less'

    # uglifyjs files
    uglify:
      immytypeahead:
        src: 'jquery.immytypeahead.js'
        dest: 'jquery.immytypeahead.min.js'
      knockoutImmytypeahead:
        src: 'knockout-immytypeahead.js'
        dest: 'knockout-immytypeahead.min.js'
  }

  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-less'

  grunt.registerTask('default', [
    'coffee',
    'less',
    'uglify'
  ])