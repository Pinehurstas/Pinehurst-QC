export type Property = { id: string; name: string }

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

const names = [
  'Anderson Holmes',
  'Aquila Court',
  'Aspen',
  'AVID',
  'Banning Row',
  'Bristol Village',
  'BLVD East',
  'Carver Crossing',
  'Connelly on Eleven',
  'Croft',
  'Dove Terrace',
  'Dove Tree',
  'GVG',
  'EBG',
  'Oak Park Village',
  'Parkview',
  'LHC',
  'Northlake Lofts',
  'Arbor Lakes',
  'Pine Manor',
  'Tyler Street Stacks',
  'Lakeville Pointe',
  'Hennepin Apartments',
  'Maggie Manor Too',
  'Lamplighter Village',
  'Regency',
  'Richfield 1',
  'Richfield 2',
  'Richfield 3',
  'River10',
  'Rivkin',
  'Shores',
  'TC Ortho',
  'The Commons',
  'Town Terrace',
  'Tree Tops',
  'Virginia Apartments',
  'Virginia Court',
  'Virginia Estates',
  'Virginia Terrace',
  'Wexford Commons',
]

export const properties: Property[] = names.map((name) => ({ id: slugify(name), name }))
