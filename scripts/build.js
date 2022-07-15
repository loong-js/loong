const fs = require('fs-extra');
const path = require('path');
const { rollup } = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { default: dts } = require('rollup-plugin-dts');
const ora = require('ora');
const chalk = require('chalk');

const PACKAGES_PATH = path.join(__dirname, '../packages');
const PACKAGES_NAMES = ['shared', 'core', 'component', 'observer', 'react-pure', 'react-mobx', 'react'];
const indexTypeDtsList = [];

/**
 * package
 *
 * example
 */
const external = ['react', 'mobx', 'mobx-react-lite', 'reflect-metadata'];
const outputs = ['cjs', 'esm', 'umd'];

async function buildEntry(name) {
  const PACKAGE_PATH = path.join(PACKAGES_PATH, name);
  const bundle = await rollup({
    external,
    input: path.join(PACKAGE_PATH, 'src/index.ts'),
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript(),
    ],
    onwarn(warning, defaultHandler) {
      if (['CIRCULAR_DEPENDENCY', 'MISSING_GLOBAL_NAME'].includes(warning.code)) {
        return;
      }
      console.log(warning.code)
      defaultHandler(warning);
    }
  });
  const packageConfig = require(path.join(PACKAGE_PATH, 'package.json'));

  await Promise.all(outputs.map(output => bundle.write({
    file: path.join(PACKAGE_PATH, 'dist', `index.${output}.js`),
    format: output,
    name: packageConfig.name,
    exports: 'named'
  })));
}


async function buildEntryDts(name) {
  const PACKAGE_PATH = path.join(PACKAGES_PATH, name);
  const bundle = await rollup({
    external,
    input: path.join(PACKAGE_PATH, 'src/index.ts'),
    plugins: [
      dts(),
    ],
  });
  const packageConfig = require(path.join(PACKAGE_PATH, 'package.json'));
  const file = path.join(PACKAGE_PATH, packageConfig.types);

  const result = await bundle.generate({
    format: 'es',
  });
  const indexDts = result.output[0].code;
  fs.writeFileSync(file, indexTypeDtsList.join('\n') + indexDts);
}

function setIndexTypeDtsList() {
  for (const name of PACKAGES_NAMES) {
    const PACKAGE_PATH = path.join(PACKAGES_PATH, name);
    try {
      const indexTypeDts = fs.readFileSync(
        path.join(PACKAGE_PATH, 'src/types/index.d.ts'),
        {
          encoding: 'utf-8',
        },
      );
      indexTypeDtsList.push(indexTypeDts);
    } catch {}
  }
}

async function buildPackages() {
  const spinner = ora('Packaging').start();

  spinner.text = `Reading [${chalk.blue('types')}]`;
  setIndexTypeDtsList();

  for (const name of PACKAGES_NAMES) {
    const package = `[${chalk.blue(`@loong-js/${name}`)}]`;
    spinner.text = `Packaging ${package}`;
    const distPath = path.join(PACKAGES_PATH, name, 'dist');
    spinner.text = `Remove ${package} ${chalk.red('dist')}`;
    fs.removeSync(distPath);
    spinner.text = `Create ${package} dist`;
    fs.mkdirSync(distPath);
    spinner.text = `Building ${package} dts`;
    await buildEntryDts(name);
    spinner.text = `Building ${package}`;
    await buildEntry(name);
  }

  spinner.stop();

  console.log(chalk.green('Packaging complete'));
}

buildPackages();
