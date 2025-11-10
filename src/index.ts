import { config } from "dotenv"
import pino from "pino"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { OptKey } from "./const/EnvKey.js"
import { mkdirSync } from "fs"
import { writeFile } from "fs/promises"
import { join } from "path"
import MovieNightAvailabilityClient from "./movieNightAvailability/client.js"
import { addonWithoutRegion } from "./movieNightAvailability/util.js"
import { StreamingType } from "./movieNightAvailability/type.js"
import CountryCode2Char from "./const/CountryCode.js"

type CliArgs = {
	[OptKey.Title]?: string
	[OptKey.OutDir]: string,
	[OptKey.Id]?: string
}

const logger = pino({
	name: 'find-movie'
})

function init(args: CliArgs, dotenvPath?: string) {
	logger.debug('begin init')

  config({
    path: dotenvPath
  })

	logger.debug('init file system')
	mkdirSync(args[OptKey.OutDir], {
		recursive: true
	})
}

function loadArgs(): CliArgs {
	const argv = (
		yargs(hideBin(process.argv))
	)
	.alias(OptKey.Help, 'h')
	.option(OptKey.Title, {
		alias: 't',
		description: 'title of show/movie',
		demandOption: false
	})
	.option(OptKey.Id, {
		alias: 'i',
		description: 'id of show/movie',
		demandOption: false
	})
	.option(OptKey.OutDir, {
		alias: 'o',
		description: 'output directory',
		default: 'out'
	})

	const args = argv.parse() as CliArgs

	if (args[OptKey.Title] === undefined && args[OptKey.Id] === undefined) {
		throw new Error(`one of --${OptKey.Title} or --${OptKey.Id} is required`)
	}

	return args
}

async function main() {
	const args = loadArgs()

	init(args)

	logger.info('init apiClient')
	const apiClient = new MovieNightAvailabilityClient()

	const show = await (
		args[OptKey.Title] !== undefined
		? apiClient.getShow(args[OptKey.Title])
		: apiClient.getShowById(args[OptKey.Id]!)
	)

	// present watch options by provider, then country
	const optionsByProvider: {
		[providerId: string]: {
			[country: string]: {
				[streamingType: string]: {
					addon?: string,
					since: string,
					until?: string,
					url: string
				}
			}
		}
	} = {}
	for (let [country, options] of Object.entries(show.streamingOptions)) {
		for (let option of options) {
			const providerId = (
				option.type === StreamingType.Addon
				? `${option.service.id}+${addonWithoutRegion(option.addon!.id, country as CountryCode2Char)}`
				: option.service.id
			)
			if (!(providerId in optionsByProvider)) {
				// add new provider
				optionsByProvider[providerId] = {}
			}

			const providerCountries = optionsByProvider[providerId]
			if (!(country in providerCountries)) {
				// add new country
				providerCountries[country] = {}
			}

			const providerOption = providerCountries[country]

			if (!(option.type in providerOption)) {
				// add new streaming type
				providerOption[option.type] = {
					since: new Date(option.availableSince).toISOString().substring(0, 10),
					until: (
						option.expiresOn !== undefined
						? new Date(option.expiresOn).toISOString().substring(0, 10)
						: undefined
					),
					url: option.link
				}

				if (option.type === StreamingType.Addon) {
					providerOption[option.type].addon = option.addon!.name
				}
			}
		}
	}

	console.log(JSON.stringify(optionsByProvider, undefined, 2))

	await writeFile(
		join(args[OptKey.OutDir], `${show.title}_${show.id}.json`),
		JSON.stringify(optionsByProvider, undefined, 2),
		{
			encoding: 'utf8'
		}
	)
}

main()
