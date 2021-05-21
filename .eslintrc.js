module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  globals: {
    localStorage: true,
    Buffer: true,
    Verkey: true,
    Indy: true,
  },
};
