import { URL } from "url"
import EnvKey from "../const/EnvKey.js"
import CountryCode2Char from "../const/CountryCode.js"
import { HttpMethod } from "../const/Http.js"
import { RapidApiHeader } from "../const/RapidApi.js"
import pino from "pino"
import path from "path"
import { SeriesGranularity, ShowUniCountry, ShowMultiCountry, ShowType } from "./const.js"

const logger = pino({
  name: path.basename(import.meta.filename)
})

const baseUrl = new URL(
  'https://streaming-availability.p.rapidapi.com'
)

export default class MovieNightAvailabilityClient {
  private apiKey: string

  constructor() {
    this.apiKey = process.env[EnvKey.ApiKey]!
    if (this.apiKey === undefined) {
      throw new Error(`api key not defined at ${EnvKey.ApiKey}`)
    }
  }

  private async searchShowsByTitle(title: string, country = CountryCode2Char.Default): Promise<ShowUniCountry[]> {
    logger.info(`search shows by title=${title} in country=${country}`)
    const url = new URL('/shows/search/title', baseUrl)

    url.searchParams.set('country', country)
    url.searchParams.set('title', title)
    url.searchParams.set('series_granularity', SeriesGranularity.Show)
    url.searchParams.set('show_type', ShowType.Series)

    try {
      const response = await fetch(url, {
        method: HttpMethod.Get,
        headers: {
          [RapidApiHeader.Key]: this.apiKey,
          [RapidApiHeader.Host]: baseUrl.host
        }
      })

      const res: ShowUniCountry[] = await response.json()
      return res
    }
    catch (err) {
      throw new Error('failed to fetch shows by title')
    }
  }

  private async getShowByTitle(title: string): Promise<ShowUniCountry | undefined> {
    const shows: ShowUniCountry[] = await this.searchShowsByTitle(title)
    
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

  private async getShowById(id: string): Promise<ShowMultiCountry> {
    const url = new URL(`/shows/${id}`, baseUrl)

    url.searchParams.set('series_granularity', SeriesGranularity.Show)

    try {
      const response = await fetch(url, {
        method: HttpMethod.Get,
        headers: {
          [RapidApiHeader.Key]: this.apiKey,
          [RapidApiHeader.Host]: baseUrl.host
        }
      })

      const res: ShowMultiCountry = await response.json()
      return res
    }
    catch (err) {
      throw new Error(`failed to fetch show id=${id}`)
    }
  }

  public async getShow(titleQuery: string): Promise<ShowMultiCountry> {
    let show = await this.getShowByTitle(titleQuery)

    if (show === undefined) {
      throw new Error(`show not found by title like ${titleQuery}`)
    }

    // fetch by id to get streaming options across all countries 
    return await this.getShowById(show.id)
  }
}