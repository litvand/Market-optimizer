pub struct Combination {
    bases: Box<[usize]>,
    digits: Box<[usize]>,
    prev_digits: Box<[usize]>,
    n_inc: usize,
    valid: bool,
}

/// This function initializes a `Combination` struct that can be used to iterate
/// over all possible combinations of elements from the input vectors.
///
/// # Parameters
///
/// * `vecs`: A slice of vectors. Each vector represents a set of elements to be combined.
///
/// # Returns
///
/// A new `Combination` instance initialized with:
/// - `bases`: The lengths of each input vector.
/// - `digits`: One element index per input vector.
pub fn combination<T>(vecs: &[Vec<T>]) -> Combination {
    let bases = vecs.iter().map(|vec| vec.len()).collect();
    let n_bases = vecs.len();
    Combination {
        bases,
        digits: vec![0; n_bases].into_boxed_slice(),
        prev_digits: vec![0; n_bases].into_boxed_slice(),
        n_inc: 0,
        valid: false,
    }
}

impl Combination {
    /// Need `&mut self`, but also need to return `&self.field`. (Already borrowed as mut, but need to reborrow immutably.) So return bool first.
    ///
    /// # Returns
    /// 
    /// Whether `digits` contains a new combination. If false is returned, then we have looped back to the first combination.
    pub fn next(&mut self) -> bool {
        if !self.valid {
            if self.n_inc == 0 {
                // Didn't start iterating until now
                self.valid = true;
                // First combination is all zeros.
                return true;
            } else {
                // Already finished iterating
                return false;
            }
        }

        // Initialize prev=current.
        for i_digit in 0..self.n_inc {
            self.prev_digits[i_digit] = self.digits[i_digit];
        }

        self.n_inc = 0;
        loop {
            if self.n_inc >= self.bases.len() {
                // Overflow
                // Theoretical inc after last base, so increase n_inc
                self.n_inc += 1;
                self.valid = false;
                return false;
            }

            self.digits[self.n_inc] += 1; // Increase n_inc after if
            if self.digits[self.n_inc] >= self.bases[self.n_inc] {
                // modulo base -> 0
                self.digits[self.n_inc] = 0;
                self.n_inc += 1;
            } else {
                self.n_inc += 1;
                break;
            }
        }

        assert!(self.valid);
        return true;
    }

    pub fn digits(&self) -> &Box<[usize]> {
        &self.digits
    }

    pub fn prev_digits(&self) -> &Box<[usize]> {
        &self.prev_digits
    }

    pub fn n_inc(&self) -> usize {
        self.n_inc
    }
}
