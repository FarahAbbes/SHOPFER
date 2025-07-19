// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false, // Désactive l'ordre aléatoire pour plus de stabilité
        stopOnFailure: false
      }
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'lcovonly', subdir: '.', file: 'lcov.info' },
        { type: 'text-summary' },
        { type: 'html' },
        { type: 'cobertura' } // ✅ Ajouté pour Azure DevOps
      ],
      exclude: [
        'src/assets/js/script.js'
      ],
      check: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
          excludes: [
            'src/assets/js/script.js'
          ]
        }
      }
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    // ✅ Configuration pour CI/CD
    browsers: process.env.CI ? ['ChromeHeadless'] : ['Chrome'],
    singleRun: process.env.CI ? true : false,
    restartOnFileChange: true,
    
    // ✅ Configuration spéciale pour ChromeHeadless en CI
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          '--disable-web-security',
          '--disable-gpu',
          '--remote-debugging-port=9222',
          '--headless'
        ]
      }
    },
    
    // ✅ Augmente les timeouts pour éviter les erreurs de timer
    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    captureTimeout: 60000
  });
};