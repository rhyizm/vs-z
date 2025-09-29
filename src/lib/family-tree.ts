// Family graph data model (normalized) and pure helpers.
// This file intentionally contains no UI concerns.

export type PersonID = string

export type PersonStatus = "alive" | "deceased" | "divorced"

export interface Person {
  id: PersonID
  name: string
  status: PersonStatus
  age?: number
  // arbitrary metadata extension point
  meta?: Record<string, unknown>
}

export interface ParentChildEdge {
  parentId: PersonID
  childId: PersonID
}

export type UnionStatus = "married" | "partnered" | "divorced"

export interface UnionEdge {
  id: string
  a: PersonID
  b: PersonID
  status: UnionStatus
  startYear?: number
  endYear?: number
}

export interface FamilyGraph {
  persons: Record<PersonID, Person>
  parentChild: ParentChildEdge[]
  unions: UnionEdge[]
  // Explicit sibling relationships (undirected). Optional alongside parent-derived siblings.
  siblings?: Array<{ a: PersonID; b: PersonID }>
}

// ----- Constructors -----

export function emptyGraph(): FamilyGraph {
  return { persons: {}, parentChild: [], unions: [], siblings: [] }
}

export function addPerson(graph: FamilyGraph, person: Person): FamilyGraph {
  if (graph.persons[person.id]) return graph
  return { ...graph, persons: { ...graph.persons, [person.id]: person } }
}

export function addUnion(graph: FamilyGraph, a: PersonID, b: PersonID, status: UnionStatus = "married"): FamilyGraph {
  // prevent duplicate union (same pair and not divorced twice)
  const exists = graph.unions.some(
    (u) =>
      (u.a === a && u.b === b) ||
      (u.a === b && u.b === a)
  )
  if (exists) return graph
  const union: UnionEdge = { id: `union-${Date.now()}-${Math.random().toString(36).slice(2)}`, a, b, status }
  return { ...graph, unions: [...graph.unions, union] }
}

export function addSibling(graph: FamilyGraph, a: PersonID, b: PersonID): FamilyGraph {
  if (a === b) return graph
  const key = [a, b].sort().join(":")
  const exists = (graph.siblings ?? []).some((e) => [e.a, e.b].sort().join(":") === key)
  if (exists) return graph
  const sibs = [...(graph.siblings ?? []), { a, b }]
  return { ...graph, siblings: sibs }
}

export function setUnionStatus(graph: FamilyGraph, unionId: string, status: UnionStatus): FamilyGraph {
  return { ...graph, unions: graph.unions.map((u) => (u.id === unionId ? { ...u, status } : u)) }
}

export function addParentChild(graph: FamilyGraph, parentId: PersonID, childId: PersonID): FamilyGraph {
  // prevent cycles (basic): disallow if parent is descendant of child
  if (isAncestorOf(graph, childId, parentId)) return graph
  const exists = graph.parentChild.some((e) => e.parentId === parentId && e.childId === childId)
  if (exists) return graph
  return { ...graph, parentChild: [...graph.parentChild, { parentId, childId }] }
}

// ----- Selectors -----

export function parentsOf(graph: FamilyGraph, childId: PersonID): PersonID[] {
  return graph.parentChild.filter((e) => e.childId === childId).map((e) => e.parentId)
}

export function childrenOf(graph: FamilyGraph, parentId: PersonID): PersonID[] {
  return graph.parentChild.filter((e) => e.parentId === parentId).map((e) => e.childId)
}

export function unionsOf(graph: FamilyGraph, personId: PersonID, includeDivorced = true): UnionEdge[] {
  return graph.unions.filter(
    (u) => (u.a === personId || u.b === personId) && (includeDivorced || u.status !== "divorced")
  )
}

export function spousesOf(graph: FamilyGraph, personId: PersonID, includeDivorced = true): PersonID[] {
  const set = new Set<PersonID>()
  for (const u of unionsOf(graph, personId, includeDivorced)) {
    set.add(u.a === personId ? u.b : u.a)
  }
  return [...set]
}

export function siblingsOf(graph: FamilyGraph, personId: PersonID): PersonID[] {
  const sibs = new Set<PersonID>()
  // derived by shared parents
  const parents = parentsOf(graph, personId)
  for (const p of parents) {
    for (const c of childrenOf(graph, p)) if (c !== personId) sibs.add(c)
  }
  // explicit sibling edges
  for (const e of graph.siblings ?? []) {
    if (e.a === personId) sibs.add(e.b)
    else if (e.b === personId) sibs.add(e.a)
  }
  return [...sibs]
}

// ----- Graph checks -----

export function isAncestorOf(graph: FamilyGraph, maybeAncestor: PersonID, target: PersonID): boolean {
  const seen = new Set<PersonID>()
  const stack = [target]
  while (stack.length) {
    const cur = stack.pop()!
    if (cur === maybeAncestor) return true
    for (const p of parentsOf(graph, cur)) {
      if (!seen.has(p)) {
        seen.add(p)
        stack.push(p)
      }
    }
  }
  return false
}

export function validateGraph(graph: FamilyGraph): { ok: boolean; errors: string[] } {
  const errors: string[] = []
  // unknown person ids
  for (const e of graph.parentChild) {
    if (!graph.persons[e.parentId]) errors.push(`Unknown parent ${e.parentId}`)
    if (!graph.persons[e.childId]) errors.push(`Unknown child ${e.childId}`)
  }
  for (const u of graph.unions) {
    if (!graph.persons[u.a]) errors.push(`Unknown union A ${u.a}`)
    if (!graph.persons[u.b]) errors.push(`Unknown union B ${u.b}`)
  }
  // simple cycle check: no person can be their own ancestor
  for (const id of Object.keys(graph.persons)) {
    if (isAncestorOf(graph, id, id)) errors.push(`Cycle detected at ${id}`)
  }
  // optional: limit parents <= 2
  for (const id of Object.keys(graph.persons)) {
    const p = parentsOf(graph, id)
    if (p.length > 2) errors.push(`More than two parents for ${id}`)
  }
  return { ok: errors.length === 0, errors }
}

// ----- View helpers (derivable, no persistence) -----

export interface LayoutNode {
  id: PersonID
  generation: number // 0: focus, +: ancestors, -: descendants
}

export function computeGenerations(graph: FamilyGraph, focusId: PersonID): Record<PersonID, number> {
  const gen: Record<PersonID, number> = { [focusId]: 0 }
  const queue: PersonID[] = [focusId]
  while (queue.length) {
    const cur = queue.shift()!
    const curGen = gen[cur]
    // parents at +1
    for (const p of parentsOf(graph, cur)) {
      if (!(p in gen)) {
        gen[p] = curGen + 1
        queue.push(p)
      }
    }
    // children at -1
    for (const c of childrenOf(graph, cur)) {
      if (!(c in gen)) {
        gen[c] = curGen - 1
        queue.push(c)
      }
    }
    // spouses at same generation
    for (const s of spousesOf(graph, cur)) {
      if (!(s in gen)) {
        gen[s] = curGen
        queue.push(s)
      }
    }
    // explicit siblings at same generation (does not require shared parents)
    for (const e of graph.siblings ?? []) {
      const n = e.a === cur ? e.b : e.b === cur ? e.a : null
      if (n && !(n in gen)) {
        gen[n] = curGen
        queue.push(n)
      }
    }
  }
  return gen
}

export function generationBuckets(graph: FamilyGraph, focusId: PersonID): Map<number, PersonID[]> {
  const gens = computeGenerations(graph, focusId)
  const buckets = new Map<number, PersonID[]>()
  for (const [id, g] of Object.entries(gens)) {
    const list = buckets.get(g) ?? []
    list.push(id)
    buckets.set(g, list)
  }
  // stable order: by name then id
  for (const [g, ids] of buckets) {
    ids.sort((a, b) => {
      const pa = graph.persons[a]
      const pb = graph.persons[b]
      const na = pa?.name ?? ""
      const nb = pb?.name ?? ""
      return na.localeCompare(nb) || a.localeCompare(b)
    })
    buckets.set(g, ids)
  }
  return buckets
}
