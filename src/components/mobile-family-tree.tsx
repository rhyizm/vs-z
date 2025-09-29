"use client"

import { useState, useRef, useEffect } from "react"
import {
  FamilyGraph,
  emptyGraph,
  addPerson,
  addParentChild,
  addUnion,
  addSibling,
  parentsOf,
  childrenOf,
  spousesOf,
  siblingsOf,
  generationBuckets,
} from "@/lib/family-tree"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Edit2,
  Trash2,
  Heart,
  Users,
  Baby,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Shared helpers: keep UI/behavior identical while removing duplication
type Relationship = "self" | "spouse" | "child" | "parent" | "sibling" | "grandparent" | "grandchild"
type Status = "alive" | "deceased" | "divorced"

export interface FamilyMember {
  id: string
  name: string
  relationship: Relationship
  status: Status
  age?: number
  // below are view-only (derived) for rendering; not persisted
  children: string[]
  parents: string[]
  spouses: string[]
  generation: number
  position: number
}

const relationshipLabel = (relationship: Relationship) => {
  switch (relationship) {
    case "self":
      return "本人"
    case "spouse":
      return "配偶者"
    case "child":
      return "子"
    case "parent":
      return "親"
    case "sibling":
      return "兄弟姉妹"
    case "grandparent":
      return "祖父母"
    case "grandchild":
      return "孫"
    default:
      return "家族"
  }
}

const getRelationshipIcon = (relationship: Relationship) => {
  switch (relationship) {
    case "spouse":
      return <Heart className="w-4 h-4 text-red-500" />
    case "child":
      return <Baby className="w-4 h-4 text-blue-500" />
    case "parent":
      return <Users className="w-4 h-4 text-green-500" />
    default:
      return <User className="w-4 h-4 text-gray-500" />
  }
}

const getStatusColor = (status: Status) => {
  switch (status) {
    case "deceased":
      return "border-gray-400 bg-gray-50 text-gray-700"
    case "divorced":
      return "border-orange-400 bg-orange-50 text-orange-700"
    default:
      return "border-primary bg-card text-card-foreground"
  }
}

interface MobileFamilyTreeProps {
  onComplete: (members: FamilyMember[]) => void
  onBack: () => void
}

// 汎用カルーセル: 兄弟/子どもで共通のUI・挙動
function MembersCarousel({
  items,
  selectedMember,
  onSelectMember,
  onFrontChange,
  onEditMember,
  addButton,
}: {
  items: FamilyMember[]
  selectedMember: string | null
  onSelectMember: (id: string) => void
  onFrontChange?: (id: string) => void
  onEditMember?: (id: string) => void
  addButton?: { onClick: () => void; title?: string }
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (items.length === 0) return
    if (activeIndex >= items.length) {
      setActiveIndex(Math.max(0, items.length - 1))
      return
    }
    const nextId = items[activeIndex].id
    onSelectMember(nextId)
    onFrontChange?.(nextId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, items.length])

  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="sibling-carousel">
        <div className="sibling-stack relative h-32 flex items-center justify-center">
          {items.map((m, index) => {
            const isActive = index === activeIndex
            const offset = (index - activeIndex) * 8
            const rotation = (index - activeIndex) * 3

            return (
              <Card
                key={m.id}
                className={`
                  sibling-card-stacked w-48 cursor-pointer
                  ${isActive ? "sibling-card-active" : "sibling-card-background"}
                  ${getStatusColor(m.status)}
                  ${selectedMember === m.id ? "ring-2 ring-primary shadow-lg" : ""}
                `}
                style={{
                  transform: `translateX(${offset}px) translateY(${Math.abs(offset) * 0.5}px) rotate(${rotation}deg)`,
                  zIndex: items.length - Math.abs(index - activeIndex),
                }}
                onClick={() => {
                  setActiveIndex(index)
                  onSelectMember(m.id)
                  onFrontChange?.(m.id)
                }}
              >
                <CardContent className="relative p-3">
                  <button
                    className="absolute top-2 right-2 p-1 rounded hover:bg-black/5"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditMember?.(m.id)
                    }}
                    aria-label="編集"
                    type="button"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    {getRelationshipIcon(m.relationship)}
                    <span className="text-sm font-medium truncate">{m.name}</span>
                  </div>
                  <div className="text-xs opacity-75 space-y-1">
                    <div className="flex gap-2 text-xs">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          m.status === "deceased"
                            ? "bg-gray-100 text-gray-600"
                            : m.status === "divorced"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-green-100 text-green-600"
                        }`}
                      >
                        {m.status === "alive" ? "存命" : m.status === "deceased" ? "故人" : "離別"}
                      </span>
                      {m.age && (
                        <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">{m.age}歳</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex items-center justify-between mt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex gap-2">
            {items.map((_, index) => (
              <div
                key={index}
                className={`sibling-nav-dot ${
                  index === activeIndex ? "sibling-nav-dot-active" : "sibling-nav-dot-inactive"
                }`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
            {addButton && (
              <Button
                size="sm"
                variant="outline"
                onClick={addButton.onClick}
                className="ml-2 p-1 w-6 h-6 rounded-full text-xs bg-transparent"
                title={addButton.title ?? "追加"}
              >
                +
              </Button>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveIndex(Math.min(items.length - 1, activeIndex + 1))}
            disabled={activeIndex === items.length - 1}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// 以前の SiblingCarousel / ChildrenCarousel は MembersCarousel に統合済み

export function MobileFamilyTree({ onComplete, onBack }: MobileFamilyTreeProps) {
  // Single source of truth: normalized family graph
  const [graph, setGraph] = useState<FamilyGraph>(() => {
    let g = emptyGraph()
    const rootId = "root"
    g = addPerson(g, {
      id: rootId,
      name: "被相続人",
      status: "deceased",
    })
    return g
  })

  // 何かが常に選択されるように初期選択を root に
  const [selectedMember, setSelectedMember] = useState<string>("root")
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const [currentGeneration, setCurrentGeneration] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  // 各世代ごとのカルーセル最前面ID（兄弟・子ども）
  const [frontSiblingByGen, setFrontSiblingByGen] = useState<Record<number, string | null>>({})
  const [frontChildByGen, setFrontChildByGen] = useState<Record<number, string | null>>({})

  const focusId = "root"
  const buckets = generationBuckets(graph, focusId)
  const generations = Array.from(buckets.keys()).sort((a, b) => b - a)
  const maxGeneration = Math.max(...generations)
  const minGeneration = Math.min(...generations)

  // Relationship derivation is used by builders; define it before usage
  function deriveRelationship(id: string, generation: number): Relationship {
    if (id === focusId && generation === 0) return "self"
    const isSpouse = spousesOf(graph, focusId).includes(id)
    if (isSpouse && generation === 0) return "spouse"
    if (generation === -1) return "child"
    if (generation === 1) return "parent"
    if (generation === 0) return "sibling"
    if (generation >= 2) return generation === 2 ? "grandparent" : "grandparent"
    if (generation <= -2) return generation === -2 ? "grandchild" : "grandchild"
    return "sibling"
  }

  // Build view members for a generation bucket
  const buildViewMember = (id: string, generation: number, position: number): FamilyMember => {
    const p = graph.persons[id]
    const rel = deriveRelationship(id, generation)
    return {
      id,
      name: p?.name ?? "不明",
      relationship: rel,
      status: (p?.status as Status) ?? "alive",
      age: p?.age,
      children: childrenOf(graph, id),
      parents: parentsOf(graph, id),
      spouses: spousesOf(graph, id),
      generation,
      position,
    }
  }

  const addMember = (targetId: string, type: "parent" | "child" | "spouse" | "sibling") => {
    const newId = `person-${Date.now()}`
    const defaultName = type === "parent" ? "親" : type === "child" ? "子" : type === "spouse" ? "配偶者" : "兄弟姉妹"
    setGraph((prev) => {
      let g = addPerson(prev, { id: newId, name: defaultName, status: "alive" })
      if (type === "parent") {
        g = addParentChild(g, newId, targetId)
      } else if (type === "child") {
        g = addParentChild(g, targetId, newId)
      } else if (type === "spouse") {
        g = addUnion(g, targetId, newId, "married")
      } else if (type === "sibling") {
        // 兄弟は明示的な関係エッジとして追加（親の共有は必須ではない）
        g = addSibling(g, targetId, newId)
      }
      return g
    })
    if (type === "spouse") setSelectedMember(targetId)
    else setSelectedMember(newId)
  }

  const updateMember = (id: string, updates: Partial<Pick<FamilyMember, "name" | "status" | "age">>) => {
    setGraph((prev) => {
      const p = prev.persons[id]
      if (!p) return prev
      return { ...prev, persons: { ...prev.persons, [id]: { ...p, ...updates, status: (updates.status ?? p.status) as Status } } }
    })
  }

  // 常に family 前提: フォーカス安定のため root は削除不可
  const canDelete = (member: FamilyMember) => member.id !== "root"

  const deleteMember = (id: string) => {
    const target = graph.persons[id]
    if (!target) return
    if (!canDelete({ id, name: target.name, relationship: "self", status: target.status as Status, children: [], parents: [], spouses: [], generation: 0, position: 0 })) return
    setGraph((prev) => {
      const rest = { ...prev.persons }
      delete rest[id]
      return {
        persons: rest,
        parentChild: prev.parentChild.filter((e) => e.parentId !== id && e.childId !== id),
        unions: prev.unions.filter((u) => u.a !== id && u.b !== id),
        siblings: (prev.siblings ?? []).filter((e) => e.a !== id && e.b !== id),
      }
    })
    if (selectedMember === id) {
      // fallback selection: root or any in current generation or any
      const idsInGen = buckets.get(currentGeneration) ?? []
      const fallback = idsInGen.find((pid) => pid !== id) || Object.keys(graph.persons).find((pid) => pid !== id) || "root"
      setSelectedMember(fallback)
    }
  }

  // icon/status helpers are defined at module scope to avoid duplication

  const scrollToGeneration = (generation: number) => {
    setCurrentGeneration(generation)
    if (scrollRef.current) {
      const generationIndex = generations.indexOf(generation)
      const scrollPosition = generationIndex * scrollRef.current.clientWidth
      scrollRef.current.scrollTo({ left: scrollPosition, behavior: "smooth" })
    }
  }

  const getMembersInGeneration = (generation: number) => {
    const ids = buckets.get(generation) ?? []
    return ids.map((id, idx) => buildViewMember(id, generation, idx))
  }

  const getSiblingsInGeneration = (generation: number) => {
    const generationMembers = getMembersInGeneration(generation)

    // Use graph relations to determine siblings/children of focus only
    const siblingIds = new Set<string>([focusId, ...siblingsOf(graph, focusId)])
    const childIds = new Set<string>(childrenOf(graph, focusId))

    // Spouse candidates: spouse of focus, siblings, and children (filtered to this generation)
    const spouseCandidateIds = new Set<string>([
      ...spousesOf(graph, focusId),
      ...siblingsOf(graph, focusId).flatMap((sid) => spousesOf(graph, sid)),
      ...childrenOf(graph, focusId).flatMap((cid) => spousesOf(graph, cid)),
    ])

    const siblings = generationMembers.filter((m) => siblingIds.has(m.id))
    const children = generationMembers.filter((m) => childIds.has(m.id))
    const spouses = generationMembers.filter((m) => spouseCandidateIds.has(m.id))
    const nonSiblings = generationMembers.filter(
      (m) => !siblingIds.has(m.id) && !childIds.has(m.id) && !spouseCandidateIds.has(m.id),
    )
    return { siblings, children, nonSiblings, spouses }
  }

  const getParentNames = (member: FamilyMember) => {
    return member.parents.map((pid) => graph.persons[pid]?.name || "不明").join(", ")
  }

  // スクロールで世代が変わったとき、現在の世代に属する「先頭候補」を自動選択
  useEffect(() => {
    const mems = getMembersInGeneration(currentGeneration)
    if (mems.length === 0) return
    // 既存の選択が同じ世代にあれば尊重
    if (selectedMember && mems.some((m) => m.id === selectedMember)) return
    const sibs = mems.filter((m) => m.relationship === "sibling" || m.relationship === "self")
    const childs = mems.filter((m) => m.relationship === "child")
    const fallback = sibs[0] ?? childs[0] ?? mems[0]
    setSelectedMember(fallback.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGeneration, graph])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold gradient-text">家系図を作成</h2>
              <div className="text-xs text-muted-foreground">スワイプで世代移動</div>
            </div>

            <div className="flex items-center justify-between mb-4 p-3 glass-light rounded-lg">
              <Button
                size="sm"
                variant="outline"
                onClick={() => scrollToGeneration(Math.min(currentGeneration + 1, maxGeneration))}
                disabled={currentGeneration >= maxGeneration}
                className="glass-button p-3 flex flex-col items-center gap-1 min-w-[60px]"
              >
                <ChevronUp className="w-5 h-5" />
                <span className="text-xs">上の世代</span>
              </Button>

              <div className="text-center px-4">
                <div className="text-xs text-muted-foreground">現在の世代</div>
                <div className="font-bold text-lg gradient-text">
                  {currentGeneration > 0 ? `+${currentGeneration}` : currentGeneration < 0 ? `${currentGeneration}` : "0"}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {currentGeneration > 0 ? "祖先" : currentGeneration < 0 ? "子孫" : "本人"}
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => scrollToGeneration(Math.max(currentGeneration - 1, minGeneration))}
                disabled={currentGeneration <= minGeneration}
                className="glass-button p-3 flex flex-col items-center gap-1 min-w-[60px]"
              >
                <ChevronDown className="w-5 h-5" />
                <span className="text-xs">下の世代</span>
              </Button>
            </div>

            {/* 世代ごとの表示 */}
            <div
              ref={scrollRef}
              className="mobile-tree-container flex overflow-x-auto snap-x snap-mandatory max-h-[60vh] overflow-y-auto"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft
                const containerWidth = e.currentTarget.clientWidth
                const generationIndex = Math.round(scrollLeft / containerWidth)
                if (generations[generationIndex] !== undefined) {
                  setCurrentGeneration(generations[generationIndex])
                }
              }}
            >
              {generations.map((generation) => {
                const { siblings, children, nonSiblings, spouses } = getSiblingsInGeneration(generation)
                // 親/子世代の兄弟グループをカルーセルで表示するための準備
                const generationMembers = getMembersInGeneration(generation)
                const byId: Record<string, FamilyMember> = Object.fromEntries(
                  generationMembers.map((m) => [m.id, m]),
                )
                const parentSiblingGroups: FamilyMember[][] = []
                const childSiblingGroups: FamilyMember[][] = []
                const present = new Set(generationMembers.map((m) => m.id))
                if (generation === 1) {
                  // 同世代(親世代)内の兄弟関係で連結成分を作り、親本人を含む成分や2人以上の成分をカルーセル表示
                  const visited = new Set<string>()
                  const parentSet = new Set(parentsOf(graph, focusId))
                  for (const start of present) {
                    if (visited.has(start)) continue
                    const comp: string[] = []
                    const stack = [start]
                    while (stack.length) {
                      const cur = stack.pop()!
                      if (visited.has(cur)) continue
                      visited.add(cur)
                      comp.push(cur)
                      for (const nb of siblingsOf(graph, cur)) if (present.has(nb) && !visited.has(nb)) stack.push(nb)
                    }
                    if (comp.length === 0) continue
                    const include = comp.length > 1 || comp.some((id) => parentSet.has(id))
                    if (include) parentSiblingGroups.push(comp.map((id) => byId[id]).filter(Boolean) as FamilyMember[])
                  }
                }
                if (generation === -1) {
                  const seenGroup = new Set<string>()
                  // 直系の子を中心に、その兄弟（直系でない子が含まれても可）を同一グループとしてカルーセル化
                  for (const c of children) {
                    const ids = [c.id, ...siblingsOf(graph, c.id)].filter((id) => present.has(id))
                    const norm = ids.slice().sort().join(",")
                    if (ids.length <= 1 || seenGroup.has(norm)) continue
                    seenGroup.add(norm)
                    childSiblingGroups.push(ids.map((id) => byId[id]).filter(Boolean) as FamilyMember[])
                  }
                }

                // 親/子世代の兄弟グループに属するメンバーを通常カードから除外
                const parentGroupMemberIds = new Set(parentSiblingGroups.flatMap((g) => g.map((m) => m.id)))
                const childGroupMemberIds = new Set(childSiblingGroups.flatMap((g) => g.map((m) => m.id)))
                const nonGroupNonSiblings = nonSiblings.filter(
                  (m) => !(generation === 1 && parentGroupMemberIds.has(m.id)) && !(generation === -1 && childGroupMemberIds.has(m.id)),
                )
                const remainingChildren: FamilyMember[] =
                  generation === -1 ? children.filter((c) => !childGroupMemberIds.has(c.id)) : []

                return (
                  <div key={generation} className="mobile-tree-generation snap-center min-w-full">
                    <div className="flex flex-col justify-start space-y-4 py-4">
                      {nonGroupNonSiblings.map((member) => (
                        <div key={member.id} className="relative">
                          {member.children.length > 0 && generation > minGeneration && (
                            <div className="connection-line connection-line-vertical h-8 -bottom-8 bg-primary/30" />
                          )}

                          {member.parents.length > 0 && generation < maxGeneration && (
                            <div className="connection-line connection-line-vertical h-8 -top-8 bg-primary/30" />
                          )}

                          <Card
                            className={`mobile-member-card cursor-pointer ${getStatusColor(member.status)} ${
                              selectedMember === member.id ? "ring-2 ring-primary shadow-lg" : ""
                            }`}
                            onClick={() => setSelectedMember(member.id)} // トグルせず常に選択
                          >
                            <CardContent className="relative p-3">
                              {/* 編集ボタン（非カルーセル枠は常時表示しない指定だが、利便性のため配置可） */}
                              <button
                                className="absolute top-2 right-2 p-1 rounded hover:bg-black/5"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingMember(member.id)
                                }}
                                aria-label="編集"
                                type="button"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <div className="flex items-center gap-2 mb-2">
                                {getRelationshipIcon(member.relationship)}
                                <span className="text-sm font-medium truncate">{member.name}</span>
                              </div>
                              <div className="text-xs opacity-75 space-y-1">
                                <div>{relationshipLabel(member.relationship)}</div>
                                <div className="flex gap-2 text-xs">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-xs ${
                                      member.status === "deceased"
                                        ? "bg-gray-100 text-gray-600"
                                        : member.status === "divorced"
                                          ? "bg-orange-100 text-orange-600"
                                          : "bg-green-100 text-green-600"
                                    }`}
                                  >
                                    {member.status === "alive"
                                      ? "存命"
                                      : member.status === "deceased"
                                        ? "故人"
                                        : "離別"}
                                  </span>
                                  {member.age && (
                                    <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                                      {member.age}歳
                                    </span>
                                  )}
                                </div>
                                {member.parents.length > 0 && (
                                  <div className="text-xs text-muted-foreground">親: {getParentNames(member)}</div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}

                      {siblings.length > 0 && (
                        <div className="relative">
                          <MembersCarousel
                            items={siblings}
                            selectedMember={selectedMember}
                            onSelectMember={(id) => setSelectedMember(id)}
                            onFrontChange={(id) =>
                              setFrontSiblingByGen((prev) => ({ ...prev, [generation]: id }))
                            }
                            onEditMember={(id) => setEditingMember(id)}
                          />
                        </div>
                      )}

                      {generation === 1 && parentSiblingGroups.length > 0 && (
                        <div className="relative space-y-3">
                          {parentSiblingGroups.map((group, idx) => (
                            <MembersCarousel
                              key={`parent-sib-${idx}`}
                              items={group}
                              selectedMember={selectedMember}
                              onSelectMember={(id) => setSelectedMember(id)}
                              onFrontChange={(id) =>
                                setFrontSiblingByGen((prev) => ({ ...prev, [generation]: id }))
                              }
                              onEditMember={(id) => setEditingMember(id)}
                            />
                          ))}
                        </div>
                      )}

                      {generation === -1 && childSiblingGroups.length > 0 && (
                        <div className="relative space-y-3">
                          {childSiblingGroups.map((group, idx) => (
                            <MembersCarousel
                              key={`child-sib-${idx}`}
                              items={group}
                              selectedMember={selectedMember}
                              onSelectMember={(id) => setSelectedMember(id)}
                              onFrontChange={(id) =>
                                setFrontSiblingByGen((prev) => ({ ...prev, [generation]: id }))
                              }
                              onEditMember={(id) => setEditingMember(id)}
                            />
                          ))}
                        </div>
                      )}

                      {children.length > 0 && childSiblingGroups.length === 0 && (
                        <div className="relative">
                          <MembersCarousel
                            items={children}
                            selectedMember={selectedMember}
                            onSelectMember={(id) => setSelectedMember(id)}
                            onFrontChange={(id) => setFrontChildByGen((prev) => ({ ...prev, [generation]: id }))}
                            onEditMember={(id) => setEditingMember(id)}
                            addButton={{ onClick: () => selectedMember && addMember(selectedMember, "child"), title: "子どもを追加" }}
                          />
                        </div>
                      )}

                      {generation === -1 && childSiblingGroups.length > 0 && remainingChildren.length > 0 && (
                        <div className="relative">
                          <MembersCarousel
                            items={remainingChildren}
                            selectedMember={selectedMember}
                            onSelectMember={(id) => setSelectedMember(id)}
                            onFrontChange={(id) => setFrontChildByGen((prev) => ({ ...prev, [generation]: id }))}
                            onEditMember={(id) => setEditingMember(id)}
                            addButton={{ onClick: () => selectedMember && addMember(selectedMember, "child"), title: "子どもを追加" }}
                          />
                        </div>
                      )}

                      {spouses.length > 0 && (
                        <div className="relative">
                          {spouses.map((member) => {
                            // 連れ合い（配偶先）のうち、表示条件を満たすかを判定
                            const partnerIds = member.spouses
                            const frontSiblingId = frontSiblingByGen[generation] ?? null
                            const frontChildId = frontChildByGen[generation] ?? null

                            const shouldShow = partnerIds.some((pid) => {
                              if (!graph.persons[pid]) return false
                              const partnerRel = deriveRelationship(pid, generation)
                              if (partnerRel === "self") return selectedMember === pid
                              if (partnerRel === "sibling") return selectedMember === pid || frontSiblingId === pid
                              if (partnerRel === "child") return selectedMember === pid || frontChildId === pid
                              return selectedMember === pid
                            })

                            if (!shouldShow) return null

                            return (
                            <div key={member.id} className="relative mt-2">
                              {member.children.length > 0 && generation > minGeneration && (
                                <div className="connection-line connection-line-vertical h-8 -bottom-8 bg-primary/30" />
                              )}

                              {member.parents.length > 0 && generation < maxGeneration && (
                                <div className="connection-line connection-line-vertical h-8 -top-8 bg-primary/30" />
                              )}

                              <Card
                                className={`mobile-member-card cursor-pointer ${getStatusColor(member.status)} ${
                                  selectedMember === member.id ? "ring-2 ring-primary shadow-lg" : ""
                                }`}
                                onClick={() => setSelectedMember(member.id)}
                              >
                                <CardContent className="relative p-3">
                                  {/* 配偶者カードに編集ボタン */}
                                  <button
                                    className="absolute top-2 right-2 p-1 rounded hover:bg-black/5"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingMember(member.id)
                                    }}
                                    aria-label="編集"
                                    type="button"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <div className="flex items-center gap-2 mb-2">
                                    {getRelationshipIcon(member.relationship)}
                                    <span className="text-sm font-medium truncate">{member.name}</span>
                                  </div>
                                  <div className="text-xs opacity-75 space-y-1">
                                    <div>{relationshipLabel(member.relationship)}</div>
                                    <div className="flex gap-2 text-xs">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-xs ${
                                          member.status === "deceased"
                                            ? "bg-gray-100 text-gray-600"
                                            : member.status === "divorced"
                                              ? "bg-orange-100 text-orange-600"
                                              : "bg-green-100 text-green-600"
                                        }`}
                                      >
                                        {member.status === "alive"
                                          ? "存命"
                                          : member.status === "deceased"
                                            ? "故人"
                                            : "離別"}
                                      </span>
                                      {member.age && (
                                        <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">{member.age}歳</span>
                                      )}
                                    </div>
                                    {member.parents.length > 0 && (
                                      <div className="text-xs text-muted-foreground">親: {getParentNames(member)}</div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 追加アクション（常時表示） */}
            <div className="mt-4 p-3 glass-light rounded-lg">
              <div className="text-xs text-muted-foreground mb-2">
                追加先: <strong>{graph.persons[selectedMember]?.name ?? "未選択"}</strong>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={() => addMember(selectedMember, "parent")} className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  親を追加
                </Button>
                <Button size="sm" variant="outline" onClick={() => addMember(selectedMember, "spouse")} className="text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  配偶者を追加
                </Button>
                <Button size="sm" variant="outline" onClick={() => addMember(selectedMember, "child")} className="text-xs">
                  <Baby className="w-3 h-3 mr-1" />
                  子どもを追加
                </Button>
                <Button size="sm" variant="outline" onClick={() => addMember(selectedMember, "sibling")} className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  兄弟姉妹を追加
                </Button>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={onBack} className="flex-1">
                前に戻る
              </Button>
              <Button
                onClick={() => {
                  const all = Array.from(buckets.entries())
                    .flatMap(([g, ids]) => ids.map((id, idx) => buildViewMember(id, g, idx)))
                  onComplete(all)
                }}
                className="flex-1 glass-button"
                disabled={Object.keys(graph.persons).length < 2}
              >
                次へ進む
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 編集ダイアログ */}
      {editingMember && (() => {
        const genOf = (id: string): number => {
          for (const [g, ids] of buckets) if (ids.includes(id)) return g
          return 0
        }
        const curGen = genOf(editingMember)
        const member = buildViewMember(editingMember, curGen, 0)
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditingMember(null)} />
            <div className="relative z-10 w-full max-w-sm rounded-lg bg-white shadow-xl">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-medium text-sm">{member.name} を編集</h3>
                <button
                  className="p-1 rounded hover:bg-black/5"
                  onClick={() => setEditingMember(null)}
                  aria-label="閉じる"
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <Label className="text-xs">名前</Label>
                  <Input
                    value={member.name}
                    onChange={(e) => updateMember(editingMember, { name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">状態</Label>
                    <Select
                      value={member.status}
                      onValueChange={(value: FamilyMember["status"]) => updateMember(editingMember, { status: value })}
                    >
                      <SelectTrigger className="mt-1 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alive">存命</SelectItem>
                        <SelectItem value="deceased">故人</SelectItem>
                        <SelectItem value="divorced">離別</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">年齢</Label>
                    <Input
                      type="number"
                      value={member.age ?? ""}
                      onChange={(e) =>
                        updateMember(editingMember, {
                          age: Number.isNaN(parseInt(e.target.value, 10))
                            ? undefined
                            : parseInt(e.target.value, 10),
                        })
                      }
                      className="mt-1 h-8"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex items-center justify-between">
                {canDelete(member) ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      deleteMember(editingMember)
                      setEditingMember(null)
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> 削除
                  </Button>
                ) : <div />}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingMember(null)}>
                    キャンセル
                  </Button>
                  <Button size="sm" onClick={() => setEditingMember(null)}>
                    保存
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
