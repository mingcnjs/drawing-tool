const fs = require('fs')
const path = require('path')

const prettierOptions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf8'),
)

module.exports = {
  env: {
    browser: true,
    jest: true,
  },
  parser: 'babel-eslint',
  extends: ['prettier', 'prettier/react'],
  plugins: ['react-hooks', 'prettier'],
  rules: {
    'react/jsx-filename-extension': 0,
    'react/forbid-prop-types': 0,
    'import/prefer-default-export': 0,
    'react/require-default-props': 0,
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    camelcase: 0,
    'prettier/prettier': ['error', prettierOptions],
  },
}
