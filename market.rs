use combinations::combination;
use parse::Map;

fn tilesAround(map: &Map, center_tile: usize) -> [usize] {
  let w = map.width_tiles;
  let above = center_tile - w;
  let below = center_tile + w;
  [
    above - 1,
    above,
    above + 1,
    center_tile - 1,
    center_tile + 1,
    below - 1,
    below,
    below + 1
  ]
}

fn optimizeMills(map: &Map) -> Box<[u8]> {
  let millSpots = vec![vec![1usize,
    2]];
  let mut levels = vec![0; map.ids.len()];
  let mut comb = combination(millSpots);
  while comb.next() {
    for i_city in 0..comb.n_inc() {}
  }
}

fn main() {}