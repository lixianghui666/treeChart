import { degToArc } from "./util"
import { globalConfig, defaultRectConfig, defaultCircleConfig, defaultLineConfig, offset } from "./config"
import { GraphDrawStyle, StrokeBorderType, RectState, GraphType } from "./enum"
import { GraphOption, HorizationAlign, VerticalAlign } from "../types/graph"
export class Graph {
    x: number // 起点x
    y: number
    x1: number
    y1: number
    type: GraphType
    scale: number = 1
    rotation: number = 0
    children: Graph[] = []
    draw() { }
}
export class Rect extends Graph {
    r: number // 圆角
    text?: string = "" // 文字
    textFillStyle: string = defaultRectConfig.textFillStyle // 文字填充颜色
    fillStyle: string // 填充颜色
    strokeStyle: string // 边框颜色
    strokeWidth: number // 边框宽度
    strokeBorderType: StrokeBorderType // 边框样式
    state: RectState // rect状态
    ctx: CanvasRenderingContext2D // 全局ctx
    cvs: JQuery<HTMLCanvasElement> // canvas dom
    drawStyle: GraphDrawStyle
    type: GraphType = GraphType.RECT
    constructor(config: GraphOption.Rect) {
        super();
        const {
            x,
            y,
            x1,
            y1, r,
            ctx,
            cvs,
            strokeWidth = defaultRectConfig.strokeWidth,
            drawStyle = GraphDrawStyle.FILL,
            strokeBorderType = StrokeBorderType.SOLID,
            scale = globalConfig.defaultScaleValue,
            strokeStyle = defaultRectConfig.strokeStyle,
            fillStyle = defaultRectConfig.fillStyle,
            state = RectState.DEFAULT,
            children = []
        } = config
        this.x = x
        this.y = y
        this.x1 = x1
        this.y1 = y1
        this.r = r * scale
        this.ctx = ctx
        this.cvs = cvs
        this.drawStyle = drawStyle
        this.strokeBorderType = strokeBorderType
        this.scale = scale
        this.strokeStyle = strokeStyle
        this.fillStyle = fillStyle
        this.strokeWidth = strokeWidth
        this.state = state
        this.children = children
    }
    draw() {
        let { x, y, x1, y1, r, fillStyle, text, ctx, cvs, strokeBorderType, strokeStyle, strokeWidth, drawStyle, scale, state } = this;
        x += offset.x, x1 += offset.x;
        y += offset.y, y1 += offset.y;
        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = strokeWidth;
        let lineDashOffset = 0
        if (strokeBorderType === StrokeBorderType.DASHED) {
            lineDashOffset = globalConfig.graphStrokeDashOffset
        }
        ctx.lineDashOffset = lineDashOffset;
        ctx.setLineDash([lineDashOffset]);
        if (state === RectState.DEFAULT) {
            ctx.shadowColor = "rgba(0,0,0,.05)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = ctx.shadowOffsetY = 10;
        }
        ctx.moveTo(x + r, y);
        ctx.arc(x1 - r, y + r, r, degToArc(270), degToArc(360));
        ctx.arc(x1 - r, y1 - r, r, degToArc(0), degToArc(90));
        ctx.arc(x + r, y1 - r, r, degToArc(90), degToArc(180));
        ctx.arc(x + r, y + r, r, degToArc(180), degToArc(270));
        ctx.closePath();
        switch (drawStyle) {
            case GraphDrawStyle.FILL: ctx.fill(); break;
            case GraphDrawStyle.STROKEANDFILL: ctx.fill(); ctx.stroke(); break;
            default: ctx.stroke();
        }
        new Text({
            text,
            x: x + (x1 - x) / 2,
            y: y + (y1 - y) / 2,
            maxWidth: x1 - x - 20,
            ctx,
            cvs,
            scale: 1,
            fontSize: globalConfig.graphTextFontSize * scale
        }).draw();
        ctx.closePath();
        if (state === RectState.EDIT) {
            [[x, y], [x, y1], [x1, y], [x1, y1]].map(([rx, ry]) => new Circle({
                x: rx,
                y: ry,
                r: globalConfig.graphEditConnerRadius,
                strokeStyle: globalConfig.graphEditLineColor,
                strokeWidth: globalConfig.graphEditLineWidth,
                fillStyle: globalConfig.graphEditConnerFillStyle,
                cvs,
                ctx,
                drawStyle: GraphDrawStyle.STROKEANDFILL
            }).draw());
        }
    }
}


export class Circle extends Graph {
    r: number
    fillStyle: string
    strokeStyle: string
    strokeWidth: number
    strokeBorderType: StrokeBorderType
    ctx: CanvasRenderingContext2D // 全局ctx
    cvs: JQuery<HTMLCanvasElement> // canvas dom
    drawStyle: GraphDrawStyle
    type: GraphType = GraphType.CIRCLE
    sAngle: number
    eAngle: number
    constructor(config: GraphOption.Circle) {
        super();
        const {
            ctx,
            cvs,
            x, y,
            r,
            drawStyle = GraphDrawStyle.STROKE,
            scale = 1,
            strokeStyle = defaultCircleConfig.strokeStyle,
            fillStyle = defaultCircleConfig.fillStyle,
            strokeBorderType = StrokeBorderType.SOLID,
            strokeWidth = defaultCircleConfig.strokeWidth,
            rotation = 0,
            sAngle = 0,
            eAngle = 360
        } = config
        this.scale = scale
        this.ctx = ctx
        this.cvs = cvs
        this.x = x - r
        this.y = y - r
        this.r = r * scale
        this.drawStyle = drawStyle
        this.strokeStyle = strokeStyle
        this.fillStyle = fillStyle
        this.strokeBorderType = strokeBorderType
        this.strokeWidth = strokeWidth
        this.x1 = x + r
        this.y1 = y + r
        this.rotation = rotation
        this.sAngle = sAngle
        this.eAngle = eAngle
    }
    draw() {
        const { ctx, x, y,x1,y1, r, fillStyle, drawStyle, strokeStyle, strokeWidth,rotation,sAngle,eAngle } = this,rx = Math.abs(x1 - x) / 2,ry = Math.abs(y1 - y) / 2;
        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.lineDashOffset = 0;
        ctx.setLineDash([0]);
        ctx.ellipse(x + rx,y + ry,rx,ry,rotation,degToArc(sAngle),degToArc(eAngle));
        switch (drawStyle) {
            case GraphDrawStyle.FILL: ctx.fill(); break;
            case GraphDrawStyle.STROKEANDFILL: ctx.fill(); ctx.stroke(); break;
            default: ctx.stroke();
        }
        ctx.closePath();
    }
}

export class Line extends Graph {
    strokeWidth: number
    strokeStyle: string
    cvs: JQuery<HTMLCanvasElement>
    ctx: CanvasRenderingContext2D
    type: GraphType = GraphType.LINE
    constructor(config: GraphOption.Line) {
        super();
        const {
            x,
            y,
            x1,
            y1,
            strokeWidth = defaultLineConfig.strokeWidth,
            strokeStyle = defaultLineConfig.strokeStyle,
            ctx,
            cvs,
            scale
        } = config;
        this.scale = scale
        let w = Math.abs(x - x1);
        this.x = x
        this.y = y
        this.x1 = x1
        this.y1 = y1
        this.strokeStyle = strokeStyle
        this.strokeWidth = strokeWidth
        this.ctx = ctx
        this.cvs = cvs
    }
    draw() {
        const { ctx, x, y, x1, y1, strokeStyle, strokeWidth } = this;
        ctx.beginPath();
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.closePath();
    }
}

// export class TextSpan extends Graph{

// }
export class Text extends Graph {
    text: string
    fillStyle: string
    strokeStyle: string
    fontSize: number
    fontFamily: string
    fontWeight: number | string
    textAlign: HorizationAlign
    textBaseline: VerticalAlign
    ctx: CanvasRenderingContext2D
    maxWidth: number
    drawStyle: GraphDrawStyle
    type: GraphType = GraphType.TEXT
    fh: number = 0
    padding: number
    constructor(config: GraphOption.Text) {
        super();
        const {
            x,
            y,
            text = "",
            fillStyle = globalConfig.graphTextFillStyle,
            strokeStyle = globalConfig.graphStrokeStyle,
            fontSize = globalConfig.graphTextFontSize,
            fontFamily = globalConfig.graphTextFontFamily,
            fontWeight = globalConfig.graphTextFontWeight,
            textAlign = "center",
            textBaseline = "middle",
            ctx,
            maxWidth = globalConfig.graphTextMaxWidth,
            drawStyle = GraphDrawStyle.FILL,
            scale = 1
        } = config;
        this.text = text
        this.fillStyle = fillStyle
        this.strokeStyle = strokeStyle
        this.fontSize = fontSize * scale
        this.fontFamily = fontFamily
        this.fontWeight = fontWeight
        this.textAlign = textAlign
        this.textBaseline = textBaseline
        this.ctx = ctx
        this.maxWidth = maxWidth
        this.drawStyle = drawStyle
        this.scale = scale
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        let metrics = ctx.measureText(text), fw = metrics.width, fh = metrics.fontBoundingBoxAscent;
        this.padding = 5
        this.fh = fh
        this.y = y - fh - 5;
        this.x = x - 5
        this.x1 = x + fw + 5;
        this.y1 = y + 5;

    }
    draw() {
        const { ctx, x, y, fh, text, padding, fontSize, fontFamily, fontWeight, fillStyle, maxWidth, textAlign, textBaseline, drawStyle } = this;
        ctx.fillStyle = fillStyle;
        // ctx.textAlign = textAlign;
        // ctx.textBaseline = textBaseline;
        if (drawStyle === GraphDrawStyle.FILL) {
            ctx.fillText(text, x + padding, y + fh + padding, maxWidth);
        } else {
            ctx.strokeText(text, x + padding, y + fh + padding, maxWidth);
        }
    }
}