
module.exports = {
  reject: [
    // upgrading eslint beyond v8.57.0 causes peer dependency conflict with @typescript-eslint/parser and @typescript-eslint/eslint-plugin
    // can be upgrade when the dependent packages are updated
    "eslint"
  ]
}
