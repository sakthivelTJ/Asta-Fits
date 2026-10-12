const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withIonicons(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const fontsDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/assets/fonts'
      );
      fs.mkdirSync(fontsDir, { recursive: true });

      const sourceFont = path.join(projectRoot, 'assets/fonts/Ionicons.ttf');
      if (fs.existsSync(sourceFont)) {
        fs.copyFileSync(sourceFont, path.join(fontsDir, 'Ionicons.ttf'));
        fs.copyFileSync(sourceFont, path.join(fontsDir, 'ionicons.ttf'));
      }
      return config;
    },
  ]);
};
