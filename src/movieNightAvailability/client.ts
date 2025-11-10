import EnvKey from "../const/EnvKey.js"
import CountryCode2Char from "../const/CountryCode.js"
import pino from "pino"
import path from "path"
import { Client, Configuration, ShowType, SearchShowsByTitleSeriesGranularityEnum as SeriesGranularity, Show } from "streaming-availability"

const logger = pino({
  name: path.basename(import.meta.filename)
})

export default class MovieNightAvailabilityClient {
  private client: Client

  constructor() {
    const apiKey = process.env[EnvKey.ApiKey]!
    if (apiKey === undefined) {
      throw new Error(`api key not defined at ${EnvKey.ApiKey}`)
    }

    this.client = new Client(new Configuration({
      apiKey
    }))
  }

  private async searchShowsByTitle(title: string, country = CountryCode2Char.Default): Promise<Show[]> {
    logger.info(`search shows by title=${title} in country=${country}`)

    try {
      return await this.client.showsApi.searchShowsByTitle({
        title,
        country,
        showType: ShowType.Series,
        seriesGranularity: SeriesGranularity.Show
      })
    }
    catch (err) {
      throw new Error('failed to fetch shows by title')
    }
  }

  private async getShowByTitle(title: string): Promise<Show | undefined> {
    const shows: Show[] = await this.searchShowsByTitle(title)
    
    if (shows.length <= 0) {
      logger.warn(`no shows found matching title like ${title}`)
      return undefined
    }
    else if (shows.length > 1) {
      logger.info(`found ${shows.length} shows matching title~${title}`)
      for (let [index, show] of Object.entries(shows)) {
        logger.debug(`[${index}]: id=${show.id} title=${show.title}`)
      }
    }
    
    // assume first result is correct
    const show = shows[0]
    logger.info(`found show id=${show.id} title=${show.title} showType=${show.showType}`)
    return show
  }

  public async getShowById(id: string): Promise<Show> {
    try {
      return await this.client.showsApi.getShow({
        id,
        seriesGranularity: SeriesGranularity.Show
      })
    }
    catch (err) {
      throw new Error(`failed to fetch show id=${id}`)
    }
  }

  public async getShow(titleQuery: string): Promise<Show> {
    let show = await this.getShowByTitle(titleQuery)

    if (show === undefined) {
      throw new Error(`show not found by title like ${titleQuery}`)
    }

    // fetch by id to get streaming options across all countries 
    return await this.getShowById(show.id)
  }
}