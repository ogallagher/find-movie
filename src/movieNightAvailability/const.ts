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

export type StreamingOptions = {
  service: {
    id: string
    name: string
    type: StreamingType
    expiresOn: number
    availableSince: number
  }
}

export type Show = {
  itemType: SeriesGranularity
  showType: ShowType
  id: string
  imdbId: string
  title: string
  originalTitle: string
  overview: string
  releaseYear: number
  runtime: number
  streamingOptions: {
    [country: string]: StreamingOptions[]
  }
}

