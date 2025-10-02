import { config } from "dotenv"
import MovieNightAvailabilityClient from "./movieNightAvailability/client.js"
import pino from "pino"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { OptKey } from "./const/EnvKey.js"

const logger = pino({
	name: 'find-movie'
})

function init(dotenvPath?: string) {
	logger.debug('begin init')

  config({
    path: dotenvPath
  })
}

function loadArgs() {
	const argv = (
		yargs(hideBin(process.argv))
	)
	.option(OptKey.Title, {
		alias: 't',
		description: 'title of show',
		demandOption: true
	})

	return argv.parse() as {
		[OptKey.Title]: string
	}
}

async function main() {
	const args = loadArgs()

	logger.info('init apiClient')
	const apiClient = new MovieNightAvailabilityClient()

	const show = await apiClient.getShow(
		args[OptKey.Title]
	)
	console.log(JSON.stringify(show, undefined, 2))
}

init()

main()
