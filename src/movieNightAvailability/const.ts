export enum SeriesGranularity {
  Show = 'show',
  Season = 'season',
  Episode = 'episode'
}

export enum ShowType {
  Movie = 'movie',
  Series = 'series'
}

export enum StreamingType {
  /**
   * Available as child provider/platform of another?
   */
  Addon = 'addon',
  Rent = 'rent',
  Buy = 'buy',
  /**
   * Included with subscription.
   */
  Subscription = 'subscription'
}

export type StreamingService = {
  id: string
  name: string
}

export type StreamingOption = {
  type: StreamingType
  expiresOn?: number
  availableSince: number
  addon? : {
    id: string
    name: string
  }
}

export type StreamingServiceOption = StreamingService & StreamingOption

type Show = {
  itemType: SeriesGranularity
  showType: ShowType
  id: string
  imdbId: string
  title: string
  originalTitle: string
  overview: string
  releaseYear: number
  runtime: number
}

export type ShowUniCountry = Show & {
  streamingOptions: {
    [country: string]: {
      service: StreamingServiceOption
    }[]
  }
}

export type ShowMultiCountry = Show & {
  streamingOptions: {
    [country: string]: (
      {
        service: StreamingService
      } 
      & StreamingOption
    )[]
  }
}
