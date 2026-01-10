const nx = require("@nx/eslint-plugin");

module.exports = [
    {
        files: [
            "**/*.json"
        ],
        plugins: {
            "@nx": nx
        },
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"
                    ],
                    ignoredDependencies: [
                        "@adaskothebeast/http-params-processor-angular"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: require("jsonc-eslint-parser")
        }
    },
    ...nx.configs["flat/angular"],
    ...nx.configs["flat/angular-template"],
    {
        files: [
            "**/*.ts"
        ],
        rules: {
            "@angular-eslint/directive-selector": [
                "error",
                {
                    type: "attribute",
                    prefix: "adaskothebeast",
                    style: "camelCase"
                }
            ],
            "@angular-eslint/component-selector": [
                "error",
                {
                    type: "element",
                    prefix: "adaskothebeast",
                    style: "kebab-case"
                }
            ]
        }
    },
    {
        files: [
            "**/*.html"
        ],
        rules: {}
    }
];
