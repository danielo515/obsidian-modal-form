import { type JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
    // preset: 'ts-jest/presets/default-esm', // or other ESM presets
    preset: 'ts-jest', // or other ESM presets
    moduleDirectories: ['node_modules', '<rootDir>'],
    roots: ['src'],
    moduleNameMapper: {
        '^@std$': '<rootDir>/src/std/$1',
    },
    transformIgnorePatterns: ['node_modules/(?!(svelte)/)'],
    transform: {
        '^.+\\.(t|j)sx?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
}
export default jestConfig
