
///<reference path="./graph.d.ts"/>
type TypeObject<T extends string | number | symbol,D> = Record<T,D>
interface Rect {
    id: number
    title: string
    x: number
    y: number
    w: number
    h: number
    textColor: string
    rectColor: string
    lines: number[]
    page: string
    prev: number | null
    next: number | null
    parent: number | null
    children: number[]
    border: boolean
    fontSize?: number
}

interface Point{
    x: number
    y: number
}

type LineType = "solid" | "dashed"

interface Line{
    id: number
    start: number
    end: number | null
    cpoint_start: Point | null
    cpoint_end: Point | null
    dev: boolean
    type: LineType
}

interface Menu{
    title?: string,
    cb: Function,
    sort: number
}

interface Menus {
    [k: string]: Menu
}