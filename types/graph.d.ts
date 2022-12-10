
type HorizationAlign = "left" | "center" | "right"
type VerticalAlign = "top" | "middle" | "bottom"
import {Graph} from "../ts/graph"
namespace GraphOption{
    export interface GraphOption{
        x: number
        y: number
        ctx: CanvasRenderingContext2D
        cvs: JQuery<HTMLCanvasElement>
        scale?: number,
        children?: Graph[]
        rotation?: number
    }
    export interface Zenith{
        x: number
        y: number
        x1: number
        y1: number
    }
    export interface Rect extends Circle{
        x1: number
        y1: number
        state?: RectState
    }
    export interface Circle extends GraphOption{
        r: number
        drawStyle?: GraphDrawStyle
        strokeBorderType?: BorderStype
        fillStyle?: F
        strokeStyle?: string
        fillStyle?: string
        strokeWidth?: number
        sAngle?: number
        eAngle?: number
    }
    export interface Text extends GraphOption{
        text?: string
        fontSize?: number
        fontFamily?: string
        fontWeight?: number | string
        textAlign?: HorizationAlign
        textBaseline?: VerticalAlign
        strokeStyle?: string
        fillStyle?: string
        maxWidth?: number
        drawStyle?: GraphDrawStyle
    }
    export interface Line extends GraphOption{
        x1: number
        y1: number
        strokeWidth?: number
        strokeStyle?: string
    }
}