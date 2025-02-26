# Only windmills

Out of potential max level spots, place as far as possible from direction that you'll place the next windmill

# Market and windmill grid

Market max level is 8. Can't get max level with single windmill.

Max level of windmill next to two markets is 6 with border growth; 5 if next to city.

# Best number of markets for windmill

Max stars from number of adjacent crops: derivative = 0

floor(f/2) * ceil(f/2)

# Non-overlapping x coordinate

fff
fcf       fff
fff    ffffcf
fff fcffff
fcf fff
fff

# As graph

Maximum flow
Longest path

Maximum choices for each city, including windmills and uncovered farms of adjacent cities. Some choices not compatible with other choices of adjacent cities.

Node for each choice, with node weight equal to number of stars of that city

Edge between compatible nodes

No edges between nodes of same city, though there are paths between nodes of the same city. Directed graph to destroy same-city-paths?

Maximum weight path? No. Instead maximum weight covering tree. Though actually, not all nodes get used up (one choice per city), so it's not really a covering.

`https://en.m.wikipedia.org/wiki/Maximum_weight_matching`

Each city is a independent set of vertices (no edges between vertices of the same city). Choose exactly one vertex from each set. Must have paths from starting vertex to every chosen vertex.

Directed acyclic graph of cities, if we viewed each set as a node.

`https://en.m.wikipedia.org/wiki/Boolean_satisfiability_problem`

Disjunctive normal form

`https://en.m.wikipedia.org/wiki/Minimum_spanning_tree`

Arbitrarily choose spanning tree, then convert nodes to edges, then find maximum spanning tree as minimum of negative weights

# Theoretical polynomial time

If we could actually store a value for each vertex and edges between each pair of vertices.

Kind of like the algorithm for longest path in DAG.

City set graph is like a blueprint for the shape that the output must have. One vertex per city and edges between vertices where there are edges between city sets.

Must have edge between each pair of geometrically adjacent cities. Output is DAG with highest sum of node weights.

Top to bottom, left to right.

Legend:
v=vertex
x=diagonal downward-directed edges
e=exterior, ie not reached yet
i=interior
i2=new interior city, added by checking edges with 2 old interior cities
c=city

sum = sum in ci

--------
```
 v v   ->   v v v   ->   v v
  ↓     x     ↓     x     ↓
v v v  ->  v v v v  ->  v v v
  ↓     x     ↓     x     ↓
 v v   ->   v v v   ->   v v
```
--------
c0  c1  c2  c3
c4  c5  c6  c7
c8  c9
--------
ce  ce  ce  ce
ce  ce  ce  ce
ce  ce
--------
ci0 ce  ce  ce
ce  ce  ce  ce
ce  ce
--------
ci  ci1 ce  ce
ce  ce  ce  ce
ce  ce
--------
ci  ci  ci1 ce
ce  ce  ce  ce
ce  ce
--------
ci  ci  ci  ci1
ce  ce  ce  ce
ce  ce
--------
ci  ci  ci  ci
ci2 ce  ce  ce
ce  ce
--------
ci  ci  ci  ci
ci  ci4 ce  ce
ce  ce
--------
ci  ci  ci  ci
ci  ci  ci4 ce
ce  ce
--------
ci  ci  ci  ci
ci  ci  ci  ci3
ce  ce
--------
ci  ci  ci  ci
ci  ci  ci  ci
ci2 ce
--------
ci  ci  ci  ci
ci  ci  ci  ci
ci  ci4
--------

O(N * V^5)?
```
function addCity(verticesA, verticesB, sumsB) {
  // O(verticesA * verticesB)
  for iB in verticesB {
    iA = max(iV where isEdge(iCityA, iV, iCityB, iB)) // O(verticesA)
    sumsB[iB] = verticesA[iA] + verticesB[iB]
  }
}

sums = []
vertices = []
for iCity in cities {
  // Example: vertices[0] = [{id: 0, weight: 0}, {id: 1, weight: 8}]
  vertices[iCity] = cityVertices() // Sorted by weight, then assigned ids
  
  // Maximum weight sum assuming we include vertex with this id in the output
  sums[iCity] = []
}

sumsA = sortByWeight(copy(verticesA))
sumsB = sortByWeight({id: iB, link: max iA where isEdge(sumsA[iA].id, iB) for iB in verticesB)
sumsA[sumsB[iB].link] = {id: sums[iB].link, link: iB}

// Non-overlapping case:
sumsC = sortByWeight({id: iC, weight: verticesC[iC].weight + sumsB[max iB where isEdge(sumsB[iB].id, iC)].weight for iC in verticesC)

// Overlapping case:
sumsC = sortByWeight({id: iC, weight: verticesC[iC].weight + sumsB[max iB where isEdge(sumsB[iB].id, iC)].weight for iC in verticesC)

////////

First compute all individual vertices: O(N*V).

0 1 2 3 4 5
// O(V log V)
Prev0[i0] = 0
Sum0[i0] = V0[i0] // Sum0[i] is maximum sum of vertex weights of path up to city 0 if vertex i of city 0 is included in the path.
Order0 = sortOrder(Sum0) // Speeds up argmax. Sum0[Order0[0]] == max(Sum0)

// O(V^2) in worst case. Can return early once we find isEdge==true.
Prev1[i1] = argmax(Sum0[i0] + V1[i1] where isEdge01(i0, i1)) = argmax(Sum0 where isEdge01(, i1))
Sum1[i1] = Sum0[Prev1[i1]] + V1[i1]
Order1 = sortOrder(Sum1)

0 1 2
3 4 5
6 7 8

Select i4 where isEdge(i4, c0) and isEdge(i4, c1) and isEdge(i4, c3)

(All i4 because of possibility of no market or windmill.)

Worst case with 10 cities

   kkkhhh
jjjkkkhhh
jjjkkkhhhggg
jjjjbbbbbggg
 aaabbbbbggg
 aaabbbbbfff
 aaabbbbbfff
 cccbbbbbfff
 cccdddeee
 cccdddeee
    dddeee

j-k-h-g
a     f
c-d---e

Boundary movement order: f, gbe, hbe, kbe, jbe, abe, cbe, dbe.

abc
defk
ghj

Boundary: k, cfj, beh, adg.

Sk[ik] = 0

for (ic, if, ij) if isEdge(ic, if) and isEdge(if, ij):
  for (ik) if isEdge(ic, ik) and isEdge(if, ik) and isEdge(ij, ik):
    Scfj[ic, if, ij] = max(Scfj[ic, if, ij], Vk[ik])

for (ib, ie, ih) if isEdge(ib, ie) and isEdge(ie, ih):
  for (ic, if, ij) if edgesFrom(ib, ic, if, ij) and edgesFrom(ie, ic, if, ij) and edgesFrom(ih, ic, if, ij):
    Sbeh[ib, ie, ih] = max(Sbeh[ib, ie, ih], Vc[ic] + Vf[if] + Vj[ij] + Scfj[ic, if, ij])

For every possible choice of vertices on the boundary, we know the best possible sum of the vertices in the interior. The exterior outside the boundary is entirely unknown.

O(sqrt(N) * V^(floor(sqrt(N))^2))

Min cut in terms of vertices (like articulation) prioritizes space complexity. Min cut in terms of edges prioritizes time complexity.
```


# Reducing vertices per city

# Early stopping

Greedy algorithm with backtracking

indexByCity = []
for ws of weightsByCity {
  sort(ws)
  indexByCity.push(ws.length - 1)
}
edges = getEdges(weightsByCity)

dec = 0
while missingEdge(indexByCity, edges) {
  ++dec
  
}

# Counter

```
function initDigits(bases) {
  return bases.map(_ => 0)
}

function incDigits(digits, bases) {
  let iDigit = 0
  while true {
    ++digits[iDigit]
    if digits[iDigit] < bases[iDigit] {
      return false // No overflow
    }
    
    digits[iDigit] = 0
    ++iDigit
    if iDigit >= digits.length {
      return true // Overflow
    }
  }
}

arrays = [
  [0, 0, 1, 999],
  [0, 0, 1, 2, 999],
  [0, 10, 999],
  [3, 999]
]

function hasEdges() {
  return (v0 > 0 and v1 > 0) or (v2 > 0) or all999()
}

firsts = arrays.map(_ => 0)
lasts = arrays.map(_ => -1)
bases = arrays.map(a => a.length)
digits = bases.map(_ => 0)

```

# City population/level

Doesn't matter much compared to markets (up to 1 star difference per city). Also, optimal choice is correlated with optimal markets, because higher building level increases both city population and market levels.

# Heuristics

Sort to decreasing number of adjacent cities.

```
Aquarion example

 fe f
e0 e1e
eee fe
  eeeeeee  fe
   2 eeff e3e
  eeeee4efeff
  eeeeeffe e
  f5eeeee 6f  eee
```

```
Third, non-adjacent city dependency
________
 c  fcf
 ff fff
  fff
  fcf
________
 c  fcf
 +$ $+f
  f+$
  fcf

+ 1, 3, 3
$ 4, 6, 6 = 16
________
 c  fcf
 +$ fff
  f+f
  fcf

+ 1, 5, 0
$ <= 6
________
 c  fcf
 ff f+f
  f+$
  fcf
  
+ 0, 5, 4
$ <= (9 -> 8)
________
 c  fcf
 ff $+f
  f+f
  fcf

+ 0, 5, 4
$ <= (9 -> 8)
________
 c  fcf
 +$ fff
  f+f
  fc$

+ 1, 4, 0
$ 5, 4, 0 = 9
________
 c  fcf
 ff $+f
  f+$
  fcf

+ 0, 4, 3
$ 0, 7, 7 = 14

```
