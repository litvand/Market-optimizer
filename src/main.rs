mod combinations;
mod parse;

use std::str::FromStr;

use combinations::combination;
use parse::Map; 

/// Calculates the indices of the eight tiles surrounding a given center tile on the map.
///
/// # Arguments
///
/// * `center_tile` - The index of the center tile for which surrounding tiles are calculated.
/// * `map` - A reference to the Map object containing information about the map's dimensions.
///
/// # Returns
///
/// An array of 8 `usize` values representing the indices of the surrounding tiles in the order:
/// top-left, top, top-right, left, right, bottom-left, bottom, bottom-right.
fn tiles_around(center_tile: usize, map: &Map) -> [usize; 8] {
    let w = map.width();
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

fn optimize_mills(map: &Map) -> Box<[usize]> {
    let mill_spots = vec![vec![1usize, 2]];
    let mut levels = vec![0u8; map.ids().len()].into_boxed_slice();
    let mut comb = combination(&mill_spots);
    let mut best = Vec::new().into_boxed_slice();
    while comb.next() {
        for i_city in 0..comb.n_inc() {
            levels[i_city] = 0;
        }
        best = comb.digits().clone();
    }
    best
}

fn main() {
    let map = Map::from_str(parse::MAP).unwrap();
    optimize_mills(&map);
}