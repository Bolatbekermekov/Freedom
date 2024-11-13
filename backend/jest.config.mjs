/** @type {import('jest').Config} */
const config = {
	roots: ['<rootDir>'],
	testEnvironment: 'node',
	verbose: true,
	clearMocks: true,
	transform: {
		'^.+\\.(t|j)sx?$': [
			'@swc/jest',
			{
				jsc: {
					target: 'es2021',
				},
			},
		],
	},
	moduleFileExtensions: ['js', 'ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
}

export default config
