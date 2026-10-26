// src/data/breedData.js

export const BREED_FACTSHEETS = {
  'Gir': {
    name: 'Gir',
    species: 'Cattle (Bos indicus)',
    origin: 'Saurashtra / Gir Forest Region, Gujarat',
    nbagrCode: 'INDIA_CATTLE_0400_GIR_03003',
    milkYield: '2,000 – 3,200 kg / lactation',
    fatPercentage: '4.5% – 5.0% (A2 Beta-Casein rich)',
    lactationPeriod: '300 – 325 days',
    climateSuitability: 'Tropical semi-arid, high heat tolerance, extreme tick resistance',
    conservationStatus: 'Recognized Pure Indigenous Breed (ICAR-NBAGR)',
    morphologicalMarkers: [
      {
        part: 'Forehead & Head',
        description: 'Prominently convex, bulging forehead acting as a biological shield against sunlight.'
      },
      {
        part: 'Ears',
        description: 'Extremely long, pendulous, folded like a leaf with a distinct notch at the tip (spoiled leaf shape).'
      },
      {
        part: 'Horns',
        description: 'Curved backwards and downwards, taking a half-moon curl upwards.'
      },
      {
        part: 'Coat & Dewlap',
        description: 'Coat varies from red to speckled brown-white; voluminous loose dewlap and prominent hump.'
      }
    ],
    managementTips: 'Thrives on rotational green fodder and dry roughage; minimal susceptibility to mastitis and tropical tick-borne hemoprotozoan diseases.'
  },
  'Sahiwal': {
    name: 'Sahiwal',
    species: 'Cattle (Bos indicus)',
    origin: 'Punjab / Montgomery & Rajasthan Border Belt',
    nbagrCode: 'INDIA_CATTLE_1700_SAHIWAL_03026',
    milkYield: '2,200 – 4,000 kg / lactation',
    fatPercentage: '4.8% – 5.2%',
    lactationPeriod: '305 – 330 days',
    climateSuitability: 'Hot and dry arid plains, drought resilient, high heat dissipation',
    conservationStatus: 'Premier Indigenous Dairy Breed (ICAR-NBAGR)',
    morphologicalMarkers: [
      {
        part: 'Body & Coat',
        description: 'Reddish brown to pale red coat, cylindrical heavy body with loose skin (known as "Lola").'
      },
      {
        part: 'Forehead & Horns',
        description: 'Medium flat forehead with short, stumpy lateral horns.'
      },
      {
        part: 'Dewlap & Naval Flap',
        description: 'Heavily developed, pendulous dewlap with large naval flap in females and loose sheath in males.'
      },
      {
        part: 'Udder',
        description: 'Symmetrical, capacious bowl-shaped udder with well-placed cylindrical teats.'
      }
    ],
    managementTips: 'One of the best milch zebu breeds in India; highly responsive to balanced concentrate feeding and silage rations.'
  },
  'Red Sindhi': {
    name: 'Red Sindhi',
    species: 'Cattle (Bos indicus)',
    origin: 'Sindh region / Cultivated in Gujarat & Tamil Nadu',
    nbagrCode: 'INDIA_CATTLE_0000_REDSINDHI_03024',
    milkYield: '1,800 – 2,800 kg / lactation',
    fatPercentage: '4.5% – 5.0%',
    lactationPeriod: '290 – 310 days',
    climateSuitability: 'Hot humid and coastal tropical adaptability',
    conservationStatus: 'Indigenous Milch Breed (ICAR-NBAGR)',
    morphologicalMarkers: [
      {
        part: 'Coat Color',
        description: 'Deep dark red to dun red shades; bulls have darker extremities on shoulders and crest.'
      },
      {
        part: 'Head & Horns',
        description: 'Proportionate head with thick horns emerging laterally and curving upward.'
      },
      {
        part: 'Hump & Body',
        description: 'Compact medium-sized body with well-developed thoracic hump.'
      }
    ],
    managementTips: 'High survivability in humid conditions; gentle temperament with stable reproductive longevity.'
  },
  'Kankrej': {
    name: 'Kankrej',
    species: 'Cattle (Bos indicus - Dual Purpose)',
    origin: 'Rann of Kutch & Banaskantha, Gujarat',
    nbagrCode: 'INDIA_CATTLE_0400_KANKREJ_03011',
    milkYield: '1,500 – 2,600 kg / lactation',
    fatPercentage: '4.6% – 4.9%',
    lactationPeriod: '290 – 320 days',
    climateSuitability: 'Arid, semi-desert, desert-edge saline soils',
    conservationStatus: 'Indigenous Dual-Purpose Breed (ICAR-NBAGR)',
    morphologicalMarkers: [
      {
        part: 'Horns',
        description: 'Magnificent, strong lyre-shaped (crescent) horns turned outwards and upwards.'
      },
      {
        part: 'Gait & Posture',
        description: 'Majestic Sawai Chal (1¼ paced rhythmic gait), with head held proud and high.'
      },
      {
        part: 'Coat & Muzzle',
        description: 'Silver grey to iron grey coat; black muzzle and dark hooves.'
      }
    ],
    managementTips: 'Exceptional draught power combined with dependable milk production; extremely resistant to foot rot.'
  },
  'Tharparkar': {
    name: 'Tharparkar',
    species: 'Cattle (Bos indicus)',
    origin: 'Thar Desert / Jodhpur & Kutch border',
    nbagrCode: 'INDIA_CATTLE_1700_THARPARKAR_03028',
    milkYield: '1,800 – 3,000 kg / lactation',
    fatPercentage: '4.4% – 4.9%',
    lactationPeriod: '280 – 315 days',
    climateSuitability: 'Extreme desert conditions (-2°C winter to +48°C summer), fodder-scarcity tolerant',
    conservationStatus: 'Indigenous Dual-Purpose White Cattle',
    morphologicalMarkers: [
      {
        part: 'Coat Color',
        description: 'White or light grey coat reflecting maximum solar thermal radiation.'
      },
      {
        part: 'Face & Horns',
        description: 'Convex forehead with medium horns curving outward and forward.'
      }
    ],
    managementTips: 'Can subsist on desert scrub vegetation and drought shrubs with remarkable milk stability.'
  },
  'Murrah': {
    name: 'Murrah',
    species: 'Buffalo (Bubalus bubalis)',
    origin: 'Haryana (Rohtak, Jind, Hisar) & Punjab',
    nbagrCode: 'INDIA_BUFFALO_0500_MURRAH_01004',
    milkYield: '2,500 – 4,500 kg / lactation',
    fatPercentage: '7.0% – 8.5% (High Butterfat)',
    lactationPeriod: '305 – 330 days',
    climateSuitability: 'Sub-tropical plains; requires water wallowing or micro-sprinklers in extreme summers',
    conservationStatus: 'World-Renowned Premier Black Gold Buffalo Breed (ICAR-NBAGR)',
    morphologicalMarkers: [
      {
        part: 'Horns',
        description: 'Tightly curled spiral horns ("Jalebi" shape) curving inwards close to neck.'
      },
      {
        part: 'Body & Skin',
        description: 'Jet black ("Kala Sona") skin with fine soft hair; deep massive barrel wedge conformation.'
      },
      {
        part: 'Tail & Switch',
        description: 'Long slender tail extending past hocks with a small white switch allowed at tip.'
      },
      {
        part: 'Udder',
        description: 'Capacious square udder with evenly spaced cylindrical front and rear teats.'
      }
    ],
    managementTips: 'High responsive conversion ratio on green berseem, maize, and balanced mineral feed concentrates.'
  },
  'Jaffarabadi': {
    name: 'Jaffarabadi',
    species: 'Buffalo (Bubalus bubalis)',
    origin: 'Gir Forest & Coastal Saurashtra, Gujarat',
    nbagrCode: 'INDIA_BUFFALO_0400_JAFFARABADI_01002',
    milkYield: '2,200 – 3,800 kg / lactation',
    fatPercentage: '7.5% – 9.0%',
    lactationPeriod: '300 – 320 days',
    climateSuitability: 'Coastal humid and semi-arid terrain',
    conservationStatus: 'Heavyweight Indigenous Buffalo Breed',
    morphologicalMarkers: [
      {
        part: 'Forehead & Horns',
        description: 'Massive prominent forehead with heavy, broad, drooping horns turning down and curling upwards.'
      },
      {
        part: 'Frame & Size',
        description: 'Heaviest and largest among Indian buffalo breeds; deep broad chest.'
      }
    ],
    managementTips: 'Excellent producer of high ghee-yield milk; benefits from evening wallowing and coastal forage.'
  },
  'Mehsana': {
    name: 'Mehsana',
    species: 'Buffalo (Bubalus bubalis - Cross of Murrah x Surti)',
    origin: 'Mehsana, Banaskantha & Sabarkantha, Gujarat',
    nbagrCode: 'INDIA_BUFFALO_0400_MEHSANA_01003',
    milkYield: '2,000 – 3,500 kg / lactation',
    fatPercentage: '6.8% – 7.8%',
    lactationPeriod: '310 – 340 days',
    climateSuitability: 'Semi-arid plains, steady persistency',
    conservationStatus: 'High-Persistency Dairy Buffalo (ICAR-NBAGR)',
    morphologicalMarkers: [
      {
        part: 'Horns',
        description: 'Intermediate sickle curve, less tightly coiled than Murrah, wider than Surti.'
      },
      {
        part: 'Docility',
        description: 'Very docile temperament, regular inter-calving period.'
      }
    ],
    managementTips: 'One of the most persistent lactation cycles with very short dry intervals.'
  }
};

export function getBreedFactsheet(breedName) {
  if (!breedName) return BREED_FACTSHEETS['Gir'];
  // Exact match
  if (BREED_FACTSHEETS[breedName]) return BREED_FACTSHEETS[breedName];
  // Substring match
  const foundKey = Object.keys(BREED_FACTSHEETS).find(key => 
    breedName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(breedName.toLowerCase())
  );
  if (foundKey) return BREED_FACTSHEETS[foundKey];
  // Default fallback
  return BREED_FACTSHEETS['Gir'];
}
