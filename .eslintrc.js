module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "array-callback-return": "error",
        "block-scoped-var": "error",
        "curly": ["error", "all"],
        "eqeqeq": ["error", "always", {"null": "always"}],
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "linebreak-style": ["error", "unix"],
        "no-console": "off",
        "no-prototype-builtins": "off",
        "quotes": ["error", "double"],
        "semi": ["error", "always"]
    }
};
