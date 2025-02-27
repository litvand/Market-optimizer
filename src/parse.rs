use std::cmp;
use std::str::FromStr;

struct MapLines<'a> {
    // Number of characters horizontally
    width_chars: usize,

    // Lines of map
    lines: Box<[&'a str]>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Id(u8);

#[derive(Debug)]
pub struct Map {
    // Number of tiles horizontally
    width_tiles: usize,

    // Id of city that each tile belongs to
    ids: Box<[Id]>,

    // Type of each tile
    types: Box<[u8]>,

    // Cities
    cities: Box<[City]>,
}

#[derive(Debug)]
pub struct City {
    loc: usize,
    building_spots: Box<[usize]>,
    forge_spots: Box<[ForgeSpot]>,
    id: Id,
}

#[derive(Debug)]
pub struct ForgeSpot {
    loc: usize,
    level: u8
}

pub type MapErr = String;

impl<'a> MapLines<'a> {
    fn from_str(map: &'a str) -> Self {
        // Could use iterator size hint
        let mut lines: Vec<&str> = Vec::new();
        let mut at_start = true;
        let mut width = 0;

        for line in map.trim_end().lines() {
            let line: &str = line.trim_end();
            if at_start {
                // Skip whitespace lines at start, but not in middle of map.
                if line.len() == 0 {
                    continue;
                }

                at_start = false;
            }

            // Non-ASCII characters will result in an error later, so
            // we can assume that `len` gives the number of ASCII characters.
            width = cmp::max(width, line.len());
            lines.push(line);
        }

        Self {
            width_chars: width,
            lines: lines.into_boxed_slice()
        }
    }
}

impl Map {
    fn from_lines(map: MapLines) -> Result<Self,
    MapErr> {
        if map.width_chars % 2 != 0 {
            return Err("not even".into());
        }

        let width_tiles = 2 + map.width_chars / 2;
        let height = map.lines.len();

        let ids = vec![Id(0); width_tiles * height].into_boxed_slice();
        let types = vec![0; width_tiles * height].into_boxed_slice();
        let cities = Vec::new();
        Ok(Map {
            width_tiles,
            ids,
            types,
            cities: cities.into_boxed_slice()
        })
    }

    pub fn width(&self) -> usize {
        self.width_tiles
    }

    pub fn ids(&self) -> &[Id] {
        &self.ids
    }

    pub fn types(&self) -> &[u8] {
        &self.types
    }
}

impl FromStr for Map {
    type Err = MapErr;

    fn from_str(map: &str) -> Result<Self,
    Self::Err> {
        Self::from_lines(MapLines::from_str(map))
    }
}

pub const MAP: &str = "
1f1f1f
1f1c1f
1f1f1f
";

#[test]
fn test() {
    println!("{:?}", Map::from_str(MAP));
}