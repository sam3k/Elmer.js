module.exports = function(grunt) {

  grunt.initConfig({
  
    watch: {
      scripts: {
        files: 'elmer.js',
        tasks: ['shell'],
        options: {
          debounceDelay: 250
        }
      }
    },
    
    shell : {
      jshint: {
        //command: "jshint --config=jshint.json elmer.js",
        command: 'echo "hello"',
        stdout: true
      }
    }
    
    
  
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');
  
  grunt.registerTask('default', ['watch', 'shell']);

};