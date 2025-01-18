"use strict";

// Tile types
const CHAR0 = "0".charCodeAt(0)
const CHAR9 = "9".charCodeAt(0)
const UNUSABLE = " ".charCodeAt(0)
const CITY = "c".charCodeAt(0)
const EMPTY = "e".charCodeAt(0)
const MINE = "m".charCodeAt(0)

// Spot types
const FORGE = "^".charCodeAt(0)
const WINDMILL = "+".charCodeAt(0)
const MARKET = "$".charCodeAt(0)

function assert(bool, f = undefined) {
  if (!bool) {
    throw Error(
      f ? f(): "Unknown error"
    )
  }
}

function indexToNth(i) {
  if (i < 0) return "-" + indexToNth(-i)

  const n = i + 1
  let suffix = ""

  const doubleDigit = n % 100
  if (4 <= doubleDigit && doubleDigit <= 20) {
    suffix = "th"
  } else {
    const singleDigit = n % 10
    if (4 <= singleDigit) {
      suffix = "th"
    } else {
      const suffixes = [
        "th",
        "st",
        "nd",
        "rd"
      ]
      suffix = suffixes[singleDigit]
    }
  }

  const nth = n.toString() + suffix
  return nth
}

function toRows(map) {
  let widthR = 0
  map = map.trimEnd().toLowerCase().split("\n")
  const encoder = new TextEncoder()

  for (let yR = 0; yR < map.length; ++yR) {
    map[yR] = encoder.encode(map[yR].trimEnd())

    if (map[yR].length % 2 !== 0) {
      const yth = indexToNth(yR)
      throw Error(
        `${yth} row: Should have two characters per tile`
      )
    }

    widthR = Math.max(widthR, map[yR].length)
  }
  return {
    width: widthR,
    rows: map
  }
}

function throwTile(tiles, iTile, msg) {
  const xT = iTile % tiles.width
  const xth = indexToNth(xT - 1)

  const yT = (iTile - xT) / tiles.width
  const yth = indexToNth(yT - 1)

  const tile = String.fromCharCode(
    tiles.digits[iTile],
    tiles.types[iTile]
  )
  throw Error(
    `${yth} row ${xth} tile ${tile}: ${msg}`
  )
}

function toTile(xRows, yRows, widthTiles) {
  const xTiles = xRows/2 + 1
  const yTiles = yRows + 1
  return yTiles * widthTiles + xTiles
}

function toTiles(map) {
  // Map starts and ends with an unusable row.
  // Map rows start and end with an unusable tile.
  const widthT = map.width/2 + 2
  const area = (map.rows.length + 2) * widthT
  const tiles = {
    width: widthT,
    digits: new Uint8Array(area),
    types: new Uint8Array(area)
  }

  for (let yR = 0; yR < map.rows.length; ++yR) {
    const row = map.rows[yR]
    const yT = yR + 1
    let iT = yT * widthT

    for (let xR = 0; xR < row.length - 1; xR += 2) {
      ++iT // First tile is unusable
      if (row[xR] === UNUSABLE) continue

      //const iT = toTile(xR, yR, widthT)
      tiles.digits[iT] = row[xR]
      tiles.types[iT] = row[xR + 1]
    }
  }
  //alert(tiles.types)
  return tiles
}

function findCities(tiles) {
  // Map starts and ends with unusable tiles.
  const cities = []
  for (let iC = 0; iC < 10; ++iC) {
    cities.push({
      iTile: [],
      empties: [],
      crops: [],
      mines: [],
      forgeSpots: []
    })
  }

  // Small hash table
  const members = []
  members[CITY] = "iTile"
  members[EMPTY] = "empties"
  members[MINE] = "mines"

  const iEnd = tiles.digits.length - tiles.width - 1
  for (let iT = tiles.width + 1; iT < iEnd; ++iT) {

    const digit = tiles.digits[iT]
    if (!digit) continue

    if (digit < CHAR0 || digit > CHAR9) throwTile(
      tiles, iT, "Should start with a number"
    )

    const t = tiles.types[iT]
    const member = t === digit ? "crops": members[t]
    if (!member) {
      //alert(`${t}\n${members[t]}\n${members[CITY]}\n${CITY}`)
      throwTile(
        tiles, iT, "Unknown tile type"
      )
    }

    cities[digit - CHAR0][member].push(iT)
  }

  for (let iC = 0; iC < cities.length; ++iC) {
    const iT = cities[iC].iTile
    if (iT.length > 1) throwTile(
      tiles,
      iT[1],
      `${iT.length} duplicates of city ${iC}`
    )

    if (iT.length === 0) {
      // Doesn't change cities.length
      cities[iC] = null
    }

    assert(
      spotTile(cities[iC], 0) === 0,
      ()=>"'No building' case missing"
    )
  }
  return cities
}

function iterAround(tiles, iT, f) {
  const widthTiles = tiles.width
  f(iT - widthTiles - 1)
  f(iT - widthTiles)
  f(iT - widthTiles + 1)
  f(iT - 1)
  f(iT + 1)
  f(iT + widthTiles - 1)
  f(iT + widthTiles)
  f(iT + widthTiles + 1)
}

function setForgeSpots(tiles, cities) {
  const nearMine = new Uint8Array(tiles.digits.length)

  for (let city of cities) {
    if (!city) continue

    for (let mine of city.mines) {
      iterAround(tiles, mine, (iT) => {
        nearMine[iT] += 1
      })
    }
  }

  for (let city of cities) {
    if (!city) continue

    // Level 0 forge on an unusable tile to
    // handle the no-forge case
    city.forgeSpots.push({
      iTile: 0,
      level: 0
    })

    for (let crop of city.crops) {
      if (nearMine[crop]) {
        city.forgeSpots.push({
          iTile: crop,
          level: nearMine[crop]
        })
      }
    }

    for (let empty of city.empties) {
      if (nearMine[empty]) {
        city.forgeSpots.push({
          iTile: empty,
          level: nearMine[empty]
        })
      }
    }
  }
}

function destroyForge(city, iSpot, levels) {
  const spot = city.forgeSpots[iSpot]
  levels[spot.iTile] = 0
}

function buildForge(city, iSpot, levels) {
  const spot = city.forgeSpots[iSpot]
  levels[spot.iTile] = spot.level
  return spot.level
}

function incForges(cities, forges, levels) {
  for (let iC in cities) {
    const city = cities[iC]
    if (!city || city.forgeSpots.length < 2) {
      continue
    }

    destroyForge(city, forges[iC], levels)
    forges[iC] = (forges[iC] + 1) % city.forgeSpots.length
    const level = buildForge(city, forges[iC], levels)

    // forgeSpots[0] always has level 0, so "level 0" = wrapped around
    if (level > 0) {
      return true
    }
  }
  return false
}

function nSpots(city) {
  return 1 + city.empties.length + city.crops.length
}

// Returns iTile.
function spotTile(city, iSpot) {
  if (iSpot < 1) return iSpot

  if (iSpot < 1 + city.empties.length) {
    return city.empties[iSpot - 1]
  }

  return city.crops[iSpot - city.empties.length - 1]
}

function incWindmills(cities, windmills, levels, tiles) {
  for (let iC in cities) {
    const city = cities[iC]
    if (!city) continue

    const n = nSpots(city)
    let iTile = getSpot(city, windmills[iC])
    levels[iTile] = 0

    while (true) {
      windmills[iC] = (windmills[iC]+ 1) % n
      iTile = getSpot(city, windmills[iC])
      if (levels[iTile] === 0) break
    }

    if (iTile !== 0) {
      // Placeholder level
      levels[iTile] = 1
      return true
    }
  }

  return false
}

function incMarkets(cities, markets, levels, tiles, stars) {
  for (let iC in cities) {
    const city = cities[iC]
    if (!city) continue

    // Level x>0 => normal building
    // Level -x => market level x
    let iTile = spotTile(city, markets[iC])
    const level = levels[iTile]
    assert(
      level <= 0,
      ()=>`Markets should have negative levels, not ${level}`
    )

    // Add negative level => subtract positive level
    stars += level
    levels[iTile] = 0

    // Find next valid market spot of this city, or 0 for no market
    const n = nSpots(city)
    while (true) {
      markets[iC] = (markets[iC] + 1) % n
      iTile = spotTile(city, markets[iC])
      // Invalid if the tile already has a building
      if (levels[iTile]) continue
      if (iTile === 0) break

      iterAround(tiles, iTile, (i) => {
        const a = levels[i]
        levels[iTile] -= (a > 0) * a
      })
      // Invalid if level 0
      if (levels[iTile]) break
      
      levels[iTile] = Math.max(-8, levels[iTile])
    }
    // If looped through all valid market spots of this city, continue to next city
    if (iTile === 0) continue

    // Subtract negative level => add positive level
    stars -= levels[iTile]
    assert(
      stars >= 0,
      () => `${stars} stars`
    )
    return stars
  }

  return -1
}

function newBuildings(cities) {
  return {
    forges: new Uint8Array(cities.length),
    windmills: new Uint8Array(cities.length),
    markets: new Uint8Array(cities.length)
  }
}

function copyBuildings(buildings) {
  return {
    forges: buildings.forges.slice(),
    windmills: buildings.windmills.slice(),
    markets: buildings.markets.slice()
  }
}

function tilesToStr(tiles, cities, buildings) {
  const types = tiles.types.slice()
  const digits = tiles.digits.slice()

  for (let iC in cities) {
    const city = cities[iC]
    if (!city) continue

    const spot = city.forgeSpots[buildings.forges[iC]]
    types[spot.iTile] = FORGE
    types[spotTile(city, buildings.windmills[iC])] = WINDMILL
    types[spotTile(city, buildings.markets[iC])] = MARKET
  }

  const rows = []
  const decoder = new TextDecoder()
  const heightT = types.length/tiles.width

  for (let yT = 1; yT < heightT - 1; ++yT) {
    let iT = yT * tiles.width
    const row = new Uint8Array((tiles.width - 2) * 2)

    for (let xR = 0; xR < row.length- 1; xR += 2) {
      ++iT
      row[xR] = digits[iT]
      row[xR + 1] = types[iT]
    }
    rows.push(decoder.decode(row))
  }
  return rows.join("\n")
}

function optimize(tiles) {
  const tCity = Date.now()
  const cities = findCities(tiles)
  if (cities.length === 0) {
    return "no cities"
  }

  const tForge = Date.now()
  setForgeSpots(tiles, cities)

  const levels = new Int8Array(tiles.digits.length)
  const buildings = newBuildings(cities)
  let maxBuildings = []
  let maxStars = 0

  const tInc = Date.now()
  while (incForges(cities, buildings.forges, levels)) {
    let stars = 0
    while (stars >= 0) {
      stars = incMarkets(
        cities, buildings.markets, levels, tiles, stars
      )
      if (stars >= maxStars) {
        if (stars > maxStars) {
          maxStars = stars
          maxBuildings = []
        }
        maxBuildings.push(copyBuildings(buildings))
      }
    }
    //levels.fill(0) // Redundant
  }
  
  const tStr = Date.now()
  if (maxBuildings.length > 10) {
    const step = 1 + Math.floor(maxBuildings.length / 10)
    const keep = []
    for (let i = 0; i < maxBuildings.length; i += step) {
      keep.push(maxBuildings[i])
    }
    maxBuildings = keep
  }
  
  const maps = []
  for (let iT in tiles.types) {
    if (!tiles.types[iT]) {
      tiles.types[iT] = UNUSABLE
      tiles.digits[iT] = UNUSABLE
    }
  }
  for (const b of maxBuildings) {
    maps.push(tilesToStr(tiles, cities, b))
  }
  const out = `${maps.join("\n---\n")}\n\n${maxStars} stars\n\n`

  const tEnd = Date.now()
  const timings = `
  Cities ${tForge - tCity}ms
  Forge spots ${tInc - tForge}ms
  Inc loop ${tStr - tInc}ms
  toString ${tEnd - tStr}ms
  `
  return out + timings
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("go").onclick = () => {
    try {
      let map = document.getElementById("map").value
      map = toRows(map)
      map = toTiles(map)
      const out = optimize(map)
      document.getElementById("out").innerHTML = out
    } catch (e) {
      alert(e.stack)
    }
  }
})