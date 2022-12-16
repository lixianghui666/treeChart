
type HorizationAlign = "left" | "center" | "right"
type VerticalAlign = "top" | "middle" | "bottom"
import {Graph} from "../ts/graph"
namespace GraphOption{
    export interface GraphOption{
        points: Point[]
        ctx: CanvasRenderingContext2D
        cvs: JQuery<HTMLCanvasElement>
        scale?: number
        children?: Graph[]
        rotation?: number
        state?: RectState
        r?: number
        drawStyle?: GraphDrawStyle
        strokeBorderType?: BorderStype
        strokeStyle?: string
        fillStyle?: string
        strokeWidth?: number
        sAngle?: number
        eAngle?: number
        fontSize?: number
        fontFamily?: string
        fontWeight?: number | string
        text?: string
        state?: RectState
    }
    type Point = [number,number]
    export interface Rect extends Circle{
    }
    export interface Circle extends GraphOption{
        r: number
    }
    export interface Text extends GraphOption{
    }
    export interface Line extends GraphOption{
    }
}