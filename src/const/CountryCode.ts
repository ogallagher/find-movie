enum CountryCode2Char {
  AT = 'at',
  CO = 'co',
  GB = 'gb',
  KR = 'kr',
  MX = 'mx',
  PR = 'pr',
  US = 'us',
  Default = CountryCode2Char.US
}
export default CountryCode2Char

export const RelatedCountries: {
  [country: string]: string[]
} = {
  [CountryCode2Char.GB]: ['uk'],
  [CountryCode2Char.AT]: ['de']
}