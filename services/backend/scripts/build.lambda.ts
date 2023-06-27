import fs from 'fs/promises'
import path from 'path'

import * as esbuild from 'esbuild'
import { exec } from 'child_process'

const main = async () => {
	const packageJSON = await fs.readFile(
		path.resolve(__dirname, '..', 'package.json'),
		'utf-8',
	)

	const { _external: external, dependencies } = JSON.parse(packageJSON)

	const lambdaPackageJSON = {
		dependencies: Object.fromEntries(
			Object.entries(dependencies).filter(([name]) => external.includes(name)),
		),
	}

	try {
		await fs.rm(path.resolve(__dirname, '..', 'build.lambda'), {
			recursive: true,
		})
	} catch (error) {}

	await fs.mkdir(path.resolve(__dirname, '..', 'build.lambda'))

	await Promise.all([
		esbuild.build({
			absWorkingDir: path.resolve(__dirname, '..'),
			entryPoints: ['src/listen.lambda.ts'],
			outfile: 'build.lambda/index.js',
			external,
			bundle: true,
			minify: true,
			sourcemap: true,
			platform: 'node',
			treeShaking: true,
			logLevel: 'info',
		}),  
		fs.writeFile(
			path.resolve(__dirname, '..', 'build.lambda', 'package.json'),
			JSON.stringify(lambdaPackageJSON, null, 4),
		),
		fs.writeFile(
			path.resolve(__dirname, '..', 'build.lambda', 'yarn.lock'),
			'',
		),
		fs.writeFile(
			path.resolve(__dirname, '..', 'build.lambda', '.yarnrc.yml'),
            `nodeLinker: node-modules`
		),
	])

	await new Promise((resolve, reject) => {
		const yarnProcess = exec("yarn install", {
			cwd: path.resolve(__dirname, '..', 'build.lambda'),
		})
		yarnProcess.stdout?.pipe(process.stdout)
		yarnProcess.stderr?.pipe(process.stderr)
		yarnProcess.on('exit', (code) => {
			if (code === 0) {
				resolve(null)
			} else {
				reject(code)
			}
		})
	})
}

main()
