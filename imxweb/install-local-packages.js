const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });

// --skip-dialog will auto overwrite feeds if imx-modules are present

const imxDir = 'imx-modules';
const question = (str) => new Promise((resolve) => readline.question(str, resolve));
const steps = {
  start: async () => {
    return steps.checkForModules();
  },
  checkForModules: async () => {
    if (fs.existsSync(imxDir)) {
      if (process.env.npm_config_skip_dialog || process.env.npm_config_buildid) {
        return steps.overwrite();
      }
      const answer = await question('Found imx-modules - Do you want to overwrite the feeds? (y/n)');
      return answer.toLowerCase() === 'y' ? steps.overwrite() : steps.keepDefault();
    }
    console.log('No imx-modules found, keeping default feeds.');
    return steps.end();
  },
  overwrite: async () => {
    overwrite();
    return steps.end();
  },
  keepDefault: async () => {
    console.log('Keeping default feeds.');
    return steps.end();
  },
  end: async () => readline.close(),
};

steps.start();

function overwrite() {
  console.log('Overwriting with...');
  let installArg = '';
  fs.readdirSync(imxDir)
    .filter((file) => file.endsWith('.tgz'))
    .forEach((file) => {
      if (file.includes('imx-')) {
        const filePath = path.join(imxDir, file);
        const baseName = path.parse(file).name;
        installArg += '@' + imxDir + '/' + baseName + '@' + filePath + ' ';
        console.log(filePath);
      } else if (file.includes('cadence-icon')) {
        const filePath = path.join(imxDir, file);
        installArg += '@elemental-ui/cadence-icon' + '@' + filePath + ' ';
        console.log(filePath);
      } else if (file.includes('core')) {
        const filePath = path.join(imxDir, file);
        installArg += '@elemental-ui/core' + '@' + filePath + ' ';
        console.log(filePath);
      }
    });

  const child = child_process.spawnSync('npm', ['i', installArg, '--save=false'], { encoding: 'utf8', shell: true });
  if (child.status === 0) {
    console.log('Overwrite Finished');
  } else {
    console.log('There was an error:')
    console.error(child.output);
    process.exit(1);
  }
}