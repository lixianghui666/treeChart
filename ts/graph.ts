import { degToArc } from "./util"
import { globalConfig, offset } from "./config"
import { GraphDrawStyle, StrokeBorderType, RectState, GraphType } from "./enum"
import { GraphOption, HorizationAlign, VerticalAlign } from "../types/graph"
export class Graph {
    __config: Graph
    x: number // 起点x
    y: number
    x1: number
    y1: number
    type: GraphType
    scale: number = 1
    rotation: number = 0
    children: Graph[] = []
    ctx: CanvasRenderingContext2D // 全局ctx
    cvs: JQuery<HTMLCanvasElement> // canvas dom
    drawStyle: GraphDrawStyle
    strokeStyle: string // 边框颜色
    fillStyle: string
    strokeWidth: number // 边框宽度
    textFillStyle: string = globalConfig.graphTextFillStyle // 文字填充颜色
    strokeBorderType: StrokeBorderType
    sameScaleRatio: boolean = false
    text: string = "" // 文字
    fontSize: number
    fontFamily: string
    fontWeight: number | string
    originPos: {
        x: number
        y: number
        x1: number
        y1: number
    }
    constructor(config) {
        const {
            points,
            ctx,
            cvs,
            drawStyle = GraphDrawStyle.FILL,
            fillStyle = globalConfig.graphFillStyle,
            strokeStyle = globalConfig.graphStrokeStyle,
            strokeWidth = globalConfig.graphStrokeWidth,
            strokeBorderType = StrokeBorderType.SOLID,
            scale = globalConfig.defaultScaleValue,
            children = [],
            text = "",
            fontSize = globalConfig.graphTextFontSize,
            fontFamily = globalConfig.graphTextFontFamily,
            fontWeight = globalConfig.graphTextFontWeight,
        } = config;
        let x = points.reduce((pre: number, [x]) => Math.min(x, pre), points[0][0]),
            x1 = points.reduce((pre: number, [x]) => Math.max(x, pre), points[0][0]),
            y = points.reduce((pre: number, [_, y]) => Math.min(y, pre), points[0][1]),
            y1 = points.reduce((pre: number, [_, y]) => Math.max(y, pre), points[0][1]);
        this.__config = config
        this.x = x
        this.x1 = x1
        this.y = y
        this.y1 = y1
        this.ctx = ctx
        this.cvs = cvs
        this.drawStyle = drawStyle
        this.strokeStyle = strokeStyle
        this.strokeWidth =strokeWidth
        this.fillStyle = fillStyle
        this.strokeBorderType = strokeBorderType
        this.scale = scale
        this.children = children
        this.text = text
        this.fontSize = fontSize * scale
        this.fontFamily = fontFamily
        this.fontWeight = fontWeight
        this.originPos = {
            x, y, x1, y1
        }
    }
    draw() { }
    editDraw() {
        const { x, y, x1, y1, cvs, ctx } = this;
        new Rect({
            points: [[x, y], [x1, y1]],
            cvs,
            ctx,
            r: 0,
            state: RectState.DEFAULT,
            strokeStyle: globalConfig.graphEditLineColor,
            strokeWidth: globalConfig.graphEditLineWidth,
            drawStyle: GraphDrawStyle.STROKE
        }).draw();
    }
}
export class Rect extends Graph {
    r: number // 圆角
    state: RectState // rect状态
    type: GraphType = GraphType.RECT
    constructor(config: GraphOption.Rect) {
        super(config);
        const {
            r,
            state = RectState.DEFAULT
        } = config
        this.r = r
        this.state = state
    }
    draw(): Graph {
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
        if(text)new Text({
            text,
            points: [[x + (x1 - x) / 2 - offset.x, y + (y1 - y) / 2 - offset.y]],
            ctx,
            cvs,
            scale: 1,
            fontSize: globalConfig.graphTextFontSize * scale
        }).draw();
        ctx.closePath();
        if (state === RectState.EDIT) {
            [[x, y], [x, y1], [x1, y], [x1, y1]].map(([rx, ry]) => new Circle({
                points: [[rx - offset.x, ry - offset.y]],
                r: globalConfig.graphEditConnerRadius,
                strokeStyle: globalConfig.graphEditLineColor,
                strokeWidth: globalConfig.graphEditLineWidth,
                fillStyle: globalConfig.graphEditConnerFillStyle,
                cvs,
                ctx,
                drawStyle: GraphDrawStyle.STROKEANDFILL
            }).draw());
        }
        return this;
    }
}


export class Circle extends Graph {
    r: number
    type: GraphType = GraphType.CIRCLE
    sAngle: number
    eAngle: number
    constructor(config: GraphOption.Circle) {
        super(config);
        const {
            r,
            scale = 1,
            strokeBorderType = StrokeBorderType.SOLID,
            rotation = 0,
            sAngle = 0,
            eAngle = 360
        } = config, { x, y } = this;
        this.scale = scale
        this.x = x - r
        this.y = y - r
        this.r = r * scale
        this.strokeBorderType = strokeBorderType
        this.x1 = x + r
        this.y1 = y + r
        this.rotation = rotation
        this.sAngle = sAngle
        this.eAngle = eAngle
    }
    draw(): Graph {
        let { ctx, x, y, x1, y1, r, fillStyle, drawStyle, strokeStyle, strokeWidth, rotation, sAngle, eAngle } = this, rx = (x1 - x) / 2, ry = (y1 - y) / 2;
        x += offset.x;
        y += offset.y;
        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.lineDashOffset = 0;
        ctx.setLineDash([0]);
        ctx.ellipse(x + rx, y + ry, Math.abs(rx), Math.abs(ry), rotation, degToArc(sAngle), degToArc(eAngle));
        switch (drawStyle) {
            case GraphDrawStyle.FILL: ctx.fill(); break;
            case GraphDrawStyle.STROKEANDFILL: ctx.fill(); ctx.stroke(); break;
            default: ctx.stroke();
        }
        ctx.closePath();
        return this;
    }
}

export class Line extends Graph {
    type: GraphType = GraphType.LINE
    constructor(config: GraphOption.Line) {
        super(config);
    }
    draw() {
        let { ctx, x, y, x1, y1, strokeStyle, strokeWidth } = this;
        x += offset.x;
        y += offset.y;
        ctx.beginPath();
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.closePath();
    }
}

export class Text extends Graph {
    padding: number
    type: GraphType = GraphType.TEXT
    _x: number
    _y: number
    constructor(config: GraphOption.Text) {
        super(config)
        const { padding } = globalConfig
        this.padding = padding
        this.sameScaleRatio = true
    }
    draw(): Graph {
        let { __config, x, y, x1, padding, children } = this, { text, ctx, fontWeight, fontSize = globalConfig.graphTextFontSize, fontFamily } = __config, txts = text.split("\n");
        y += offset.y;
        if (text.trim() === "") return;
        txts.forEach(txt => {
            let metrics = ctx.measureText(txt), fw = metrics.width, fh = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
            children.push(new TextSpan({
                ...__config,
                points: [[this.x + offset.x, y]],
                text: txt
            }).draw());
            y += fh + 2 * padding;
            x = Math.max(x, this.x + fw + padding);
        });
        if (this.x1 === this.x) {
            this.x1 = x + padding;
            this.y1 = y + padding;
            this.originPos = { x: this.x, y: this.y, y1: this.y1, x1: this.x1 };
        }
        return this;
    }
}

export class TextSpan extends Text {
    constructor(config: GraphOption.Text) {
        super(config);
    }
    draw(): Graph {
        const { ctx, x, y, text, padding, fontSize, fontFamily, fontWeight, fillStyle, drawStyle } = this;
        ctx.fillStyle = fillStyle;
        ctx.textBaseline = "top";
        ctx.font = `${fontSize}px oblique normal Microsoft YaiHei`;
        if (drawStyle === GraphDrawStyle.FILL) {
            ctx.fillText(text, x + padding, y + padding);
        } else {
            ctx.strokeText(text, x + padding, y + padding);
        }
        return this;
    }
}