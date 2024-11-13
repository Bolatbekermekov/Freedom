import nextJest from 'next/jest.js'

import type { Config } from 'jest'

const createJestConfig = nextJest({
	dir: './'
})

// Add any custom config to be passed to Jest
const config: Config = {
	collectCoverage: true,
	coverageProvider: 'v8',
	testEnvironment: 'jsdom',
	moduleNameMapper: {
		'^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
		'^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
		'^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': `<rootDir>/__mocks__/fileMock.js`,
		'^@/(.*)$': '<rootDir>/src/$1',
		'@next/font/(.*)': `<rootDir>/__mocks__/nextFontMock.js`,
		'next/font/(.*)': `<rootDir>/__mocks__/nextFontMock.js`,
		'server-only': `<rootDir>/__mocks__/empty.js`
	},
	testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
	},
	transformIgnorePatterns: [
		'/node_modules/',
		'^.+\\.module\\.(css|sass|scss)$'
	],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json'
		}
	}
}

export default createJestConfig(config)
