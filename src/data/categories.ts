export type ChecklistItem = { id: string; text: string }
export type ChecklistCategory = { id: string; name: string; items: ChecklistItem[]; applicable?: boolean }

export const categories: ChecklistCategory[] = [
  {
    id: 'entry_exteriors',
    name: 'Entry/Exteriors (Check all that apply)',
    items: [
      { id: 'entrance_glass', text: 'Main entrance glass cleaned (inside/outside)' },
      { id: 'exterior_doors', text: 'Exterior doors, frames, and handles wiped down' },
      { id: 'trash_bins', text: 'Trash bins emptied and exterior clean' },
      { id: 'walls_clean', text: 'Walls free of marks or cobwebs' },
      { id: 'floors_vac_mop', text: 'Carpets/Vinyl floors vacuumed/mopped' },
    ],
  },
  {
    id: 'common_areas',
    name: 'Common Areas (Lobbies, Hallways, etc.)',
    items: [
      { id: 'carpets_stains', text: 'Carpets free of stains' },
      { id: 'carpets_vac_mop', text: 'Carpets/Vinyl floors vacuumed/mopped' },
      { id: 'baseboards_corners', text: 'Baseboards and corners cleaned' },
      { id: 'walls_clean_common', text: 'Walls free of marks or cobwebs' },
      { id: 'furniture_wiped', text: 'Furniture (if any) wiped and organized' },
      { id: 'vending_clean', text: 'Vending machines clean' },
      { id: 'drinking_fountains', text: 'Drinking fountains' },
      { id: 'doors_marks', text: 'Doors free of marks' },
      { id: 'lights_dusted', text: 'Light fixtures dusted/cleaned' },
    ],
  },
  {
    id: 'stairways',
    name: 'Stairways',
    items: [
      { id: 'stairs_clean', text: 'Stairs vacuumed or mopped' },
      { id: 'railings_dust', text: 'Railings free of dust' },
      { id: 'walls_clean_stairs', text: 'Walls free of marks or cobwebs' },
      { id: 'windows_clean', text: 'Windows Cleaned & free of dust' },
    ],
  },
  {
    id: 'restrooms',
    name: 'Restrooms (if applicable)',
    items: [
      { id: 'mirrors_spotless', text: 'Mirrors and glass spotless' },
      { id: 'counters_sinks', text: 'Countertops and sinks clean' },
      { id: 'toilets_urinals', text: 'Toilets and urinals spotless' },
      { id: 'floors_dry', text: 'Floors dry and clean' },
      { id: 'soap_full', text: 'Soap dispensers full and clean' },
      { id: 'trash_lin ers', text: 'Trash bins emptied and liners replaced' },
    ],
  },
  {
    id: 'elevators',
    name: 'Elevators (if applicable)',
    items: [
      { id: 'elev_floors', text: 'Floors clean and free of marks' },
      { id: 'steel_polished', text: 'Stainless steel polished' },
      { id: 'tracks_clean', text: 'Elevator tracks clean' },
      { id: 'walls_doors', text: 'Walls and doors free of fingerprints' },
      { id: 'elev_lights', text: 'Light fixtures clean' },
    ],
  },
  {
    id: 'laundry',
    name: 'Laundry Rooms (if applicable)',
    items: [
      { id: 'machines_clean', text: 'Machines clean and free of lint or debris' },
      { id: 'floors_swept', text: 'Floors swept and mopped' },
      { id: 'walls_clean_laundry', text: 'Walls free of marks or cobwebs' },
      { id: 'trash_clean', text: 'Trash emptied and cleaned' },
      { id: 'ventilation_clear', text: 'Ventilation clear and clean' },
    ],
  },
  {
    id: 'lounge',
    name: 'Lounge / Party Room (if applicable)',
    items: [
      { id: 'furniture_arranged', text: 'Furniture clean and arranged properly' },
      { id: 'tables_wiped', text: 'Tables and surfaces wiped down' },
      { id: 'floors_clean', text: 'Floors clean and free of debris' },
      { id: 'walls_clean_lounge', text: 'Walls free of marks or cobwebs' },
      { id: 'stove_clean', text: 'Stove clean' },
      { id: 'microwave_clean', text: 'Microwave clean' },
      { id: 'trash_bins_clean', text: 'Trash bins emptied and clean' },
      { id: 'decorations_plants', text: 'Decorations and plants maintained' },
    ],
  },
  {
    id: 'gym',
    name: 'Gym (if applicable)',
    items: [
      { id: 'equipment_wiped', text: 'Equipment wiped down and in good condition' },
      { id: 'gym_floors', text: 'Floors clean and free of dust/debris' },
      { id: 'mirrors_clean', text: 'Mirrors clean and streak-free' },
      { id: 'walls_clean_gym', text: 'Walls free of marks or cobwebs' },
      { id: 'trash_bins_gym', text: 'Trash bins emptied and clean' },
      { id: 'vending_stocked', text: 'Vending machines stocked and clean' },
    ],
  },
  {
    id: 'trash_chute',
    name: 'Trash Chute Rooms',
    items: [
      { id: 'chute_door_clean', text: 'Trash chute door is clean' },
      { id: 'walls_clean_chute', text: 'Walls free of marks or cobwebs' },
      { id: 'floors_clean_chute', text: 'Floors clean and free of debris' },
    ],
  },
  {
    id: 'misc',
    name: 'Miscellaneous Areas (if applicable)',
    items: [
      { id: 'windows_clean_misc', text: 'Windows cleaned (interior/exterior)' },
      { id: 'air_vents_clean', text: 'Air vents and AC units cleaned' },
      { id: 'signage_visible', text: 'Hallway signage clean and visible' },
      { id: 'high_dust', text: 'High dust cleaned' },
    ],
  },
]

export const cleanlinessRatings = [
  'Excellent',
  'Good',
  'Neutral',
  'Bad',
  'Extremely Bad',
] as const
export type CleanlinessRating = typeof cleanlinessRatings[number]
