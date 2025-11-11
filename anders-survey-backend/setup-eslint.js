import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log('\n🚀 Setting up global ESLint + Prettier for entire survey-app project...\n');

// 1. devDependencies 설치
execSync('npm install -D eslint prettier eslint-plugin-react eslint-config-prettier eslint-plugin-prettier', { stdio: 'inherit' });

// 2. ESLint 설정 생성
const eslintrc = {
  env: { browser: true, es2021: true, node: true },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['react', 'prettier'],
  rules: {
    'prettier/prettier': ['error', { semi: true, singleQuote: true }],
    'react/react-in-jsx-scope': 'off'
  },
  settings: { react: { version: 'detect' } }
};
writeFileSync('.eslintrc.json', JSON.stringify(eslintrc, null, 2));

// 3. Prettier 설정
writeFileSync('.prettierrc', JSON.stringify({
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100
}, null, 2));

// 4. ESLint ignore
writeFileSync('.eslintignore', 'node_modules\ndist\nbuild\n');

// 5. VSCode 설정
const vscodeDir = path.join('.vscode');
if (!existsSync(vscodeDir)) mkdirSync(vscodeDir);
writeFileSync(path.join(vscodeDir, 'settings.json'), JSON.stringify({
  'editor.formatOnSave': true,
  'editor.defaultFormatter': 'esbenp.prettier-vscode',
  'editor.codeActionsOnSave': { 'source.fixAll.eslint': true },
  'eslint.validate': ['javascript', 'javascriptreact']
}, null, 2));

// 6. package.json 수정
const pkgPath = './package.json';
const pkg = JSON.parse(String(readFileSync(pkgPath)));
pkg.scripts = {
  ...pkg.scripts,
  'lint': 'eslint . --ext .js,.jsx',
  'lint:fix': 'eslint . --ext .js,.jsx --fix'
};
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log('\n✅ Global ESLint + Prettier setup complete.');
console.log('👉 Run: npm run lint:fix  (to auto-correct all code in project)\n');
