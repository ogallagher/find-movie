import CountryCode2Char, { RelatedCountries } from "../const/CountryCode.js"

function countryIsRelated(country: CountryCode2Char, other: string) {
  return (RelatedCountries[country] || []).indexOf(other) !== -1
}

export function addonWithoutRegion(addonRaw: string, country: CountryCode2Char): string {
  let addon = addonRaw.trimEnd().toLowerCase()

  if (
    addon.endsWith(country)
    || countryIsRelated(country, addon.substring(addon.length - country.length))
  ) {
    return addon.substring(0, addon.length - country.length)
  }
  else {
    return addon
  }
}