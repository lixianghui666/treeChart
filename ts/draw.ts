import {scalePx,degToArc} from "./util"

const cvs = $(".treeChart"), ctx: CanvasRenderingContext2D = (cvs[0] as HTMLCanvasElement).getContext("2d")!
/**
 * 绘制矩形元素
 * @param rect rect元素对象
 * @param r 圆角半径
 */
export const drawRectModule = (rect: Rect, r = 6) => {
    let { x, y, w: rectW, h } = rect;
    x = scalePx(x), y = scalePx(y), r = scalePx(r);
    let x2 = x + scalePx(rectW), y2 = y + scalePx(h);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arc(x2 - r, y + r, r, degToArc(270), degToArc(360));
    ctx.arc(x2 - r, y2 - r, r, degToArc(0), degToArc(90));
    ctx.arc(x + r, y2 - r, r, degToArc(90), degToArc(180));
    ctx.arc(x + r, y + r, r, degToArc(180), degToArc(270));
    ctx.fillStyle = rect.rectColor;
    ctx.shadowColor = "rgba(0,0,0,.05)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = ctx.shadowOffsetY = 10;
    ctx.setLineDash([0]);
    ctx.lineDashOffset = 0;
    if (rect.border) {
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
    }
    ctx.fill();
    ctx.fillStyle = rect.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 ${$(window).width() / 1440 * (rect.fontSize || 12)}px Arial`;
    ctx.fillText(rect.title, x + (x2 - x) / 2, y + (y2 - y) / 2, x2 - x - 20);
    ctx.closePath();
}

/**
 * 绘制线
 * @param line 当前画的线
 * @param mx 移动的x点
 * @param my 移动的y点
 * @param dx 点击点x点
 * @param dy 点击的y点
 * @param rects 当前界面的所有rect
 */
export const drawLine = (line: Line,mx: number,my: number,dx: number,dy: number,rects: Rect[]) => {
    // 三类线
    let { start, end, cpoint_start, cpoint_end, dev } = line;
    //@ts-ignore
    let preRect: Rect = rects.find(rect => rect.id === start)!;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.lineWidth = scalePx(2);
    ctx.setLineDash([0]);
    ctx.lineDashOffset = 0;
    if (line.type == "dashed") {
        ctx.setLineDash([5]);
        ctx.lineDashOffset = 10;
    }
    let sx = scalePx(preRect.x) + scalePx(preRect.w) / 2, sy = scalePx(preRect.y) + scalePx(preRect.h) / 2, ex: number = 0, ey: number = 0;
    ctx.moveTo(sx, sy);
    if (!end) {
        ex = mx,ey = my;
        if(mx === 0 && my === 0){
            ex = dx;ey = dy;
        }
        // 还没画完
        if (cpoint_start && cpoint_end) {
            // 三次贝塞尔
            ctx.bezierCurveTo(scalePx(cpoint_start.x), scalePx(cpoint_start.y), scalePx(cpoint_end.x), scalePx(cpoint_end.y), ex,ey);
        } else if (cpoint_start) {
            // 二次贝塞尔
            ctx.quadraticCurveTo(scalePx(cpoint_start.x), scalePx(cpoint_start.y), ex,ey);
        } else {
            // 直线
            ctx.lineTo(ex,ey);
        }
    } else {
        // 已经画完了
        let curRect: Rect = rects.find(rect => rect.id === end)!
        ex = scalePx(curRect.x) + scalePx(curRect.w) / 2, ey = scalePx(curRect.y) + scalePx(curRect.h) / 2
        if (!line.cpoint_start) {
            // 直线
            ctx.lineTo(ex, ey);
        } else {
            if (line.cpoint_end) {
                // 三次贝塞尔
                ctx.bezierCurveTo(scalePx(cpoint_start!.x), scalePx(cpoint_start!.y), scalePx(cpoint_end!.x), scalePx(cpoint_end!.y), ex, ey);
            } else {
                // 二次贝塞尔
                ctx.quadraticCurveTo(scalePx(cpoint_start!.x), scalePx(cpoint_start!.y), ex, ey);
            }
        }
    }
    ctx.stroke();
    ctx.closePath();
    if (dev) {
        // 修改控制点位置
        if (cpoint_start) {
            // 画第一个控制点
            drawController(sx, sy, scalePx(cpoint_start.x), scalePx(cpoint_start.y));
        }
        if (cpoint_end) {
            // 画第二个控制点
            drawController(ex, ey, scalePx(cpoint_end.x), scalePx(cpoint_end.y));
        } else if (cpoint_start) {
            // 只有一个控制点，直接连接控制点和结束元素之间的线
            ctx.moveTo(scalePx(cpoint_start.x), scalePx(cpoint_start.y))
            ctx.lineTo(ex, ey);
            ctx.stroke();
        }
    }
}

/**
 * 绘制贝塞尔曲线控制点
 * @param mx 移动的x点
 * @param my 移动的y点
 * @param ex 结束x点
 * @param ey 结束y点
 * @param r 半径
 */
export const drawController = (mx: number, my: number, ex: number, ey: number, r = 5) => {
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1
    ctx.moveTo(mx, my);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(ex, ey, r, degToArc(0), degToArc(360));
    ctx.stroke();
    ctx.closePath();
}

/**
 * 绘制选择框
 * @param curRect 当前操作的rect
 * @param cpoint 当前操作的控制点
 * @param line 当前的线
 * @param mx 移动的x点
 * @param my 移动的y点
 * @param dx 点击点x点
 * @param dy 点击的y点
 */
export const drawSelectRect = (curRect,cpoint,line,mx,my,dx,dy) => {
    if ((mx || my) && !curRect && !cpoint && !line) {
        const points = [[dx, dy], [mx, dy], [mx, my], [dx, my], [dx, dy]]
        for (let i = 0; i < 4; ++i) {
            let [x1, y1] = points[i], [x2, y2] = points[i + 1];
            ctx.beginPath();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1;
            ctx.setLineDash([5]);
            ctx.lineDashOffset = 5;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.closePath();
        }
    }
}