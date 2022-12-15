
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
    }
    type Point = [number,number]
    export interface Rect extends Circle{
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
        strokeStyle?: string
        fillStyle?: string
        drawStyle?: GraphDrawStyle
    }
    export interface Line extends GraphOption{
        strokeWidth?: number
        strokeStyle?: string
    }
}