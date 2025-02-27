use super::*;

#[cfg(test)]
mod tests {
    use super::*;

#[test]
fn test_empty_input() {
    let mut c = combination(&Vec::<Vec<i32>>::new());
    let mut cs = Vec::new();
    while c.next() {
        cs.push(c.digits().clone());
    }
    
    assert_eq!(cs.len(), 0);
}

#[test]
fn test_single_input_vector() {
    let mut c = combination(&vec![vec![1, 2, 3]]);
    let mut cs = Vec::new();
    while c.next() {
        cs.push(c.digits().clone());
    }
    
    assert_eq!(cs.len(), 3);
    assert_eq!(*cs[0], [0]);
    assert_eq!(*cs[1], [1]);
    assert_eq!(*cs[2], [2]);
}

#[test]
fn test_different_length_vectors() {
    let mut c = combination(&vec![vec![1, 2], vec![3, 4, 5], vec![6]]);
    let mut cs = Vec::new();
    while c.next() {
        cs.push(c.digits().clone());
    }
    
    assert_eq!(cs.len(), 6);
    assert_eq!(*cs[0], [0, 0, 0]);
    assert_eq!(*cs[1], [1, 0, 0]);
    assert_eq!(*cs[2], [0, 1, 0]);
    assert_eq!(*cs[3], [1, 1, 0]);
    assert_eq!(*cs[4], [0, 2, 0]);
    assert_eq!(*cs[5], [1, 2, 0]);
}
}