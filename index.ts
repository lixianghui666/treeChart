/* 创建单个菜单 */
import "./main"
import { scalePx, enlargePx } from "./ts/util"
import { rects as originRects, lines as originLines } from "./chart-data";
import { DrawMode, EventType, GraphDrawStyle, GraphType, ParallelHorizationType, ParallerVerticalType, RectState } from "./ts/enum";
import { drawLine, drawRectModule } from "./ts/draw";
import { showMenu } from "./ts/menu";
import { Circle, Line, Rect, Graph, Text } from "./ts/graph";
import { defaultRectConfig, globalConfig, offset } from "./ts/config";
const cvs: JQuery<HTMLCanvasElement> = $(".treeChart"), ctx: CanvasRenderingContext2D = cvs[0].getContext("2d")
let w = $(window).width(), h = $(window).height();
const graphs: Graph[] = [
    new Rect({
        points: [[200,300],[340,336]],
        ctx,
        cvs,
        scale: 1,
        r: 0,
        strokeWidth: 2,
        drawStyle: GraphDrawStyle.STROKE
    }),
    new Rect({
        points: [[400,200],[540,236]],
        ctx,
        cvs,
        scale: 1,
        r: 0,
        strokeWidth: 2,
        drawStyle: GraphDrawStyle.STROKE
    }),
    new Circle({
       points: [[540,236]],
        r: 50,
        cvs, ctx
    }),
    new Text({
        points: [[100,100]],
        text: `测试，
        哈哈`,
        cvs, ctx
    })
];
let dx = 0, dy = 0, mx = 0, my = 0, preMx = 0, preMy = 0, drawMode: DrawMode | null, selRect: Rect | null = null, editGraph: Graph | null
$(window).resize(() => {
    w = $(window).width(), h = $(window).height()
    cvs[0].style.width = w + "px";
    cvs[0].style.height = h + "px";
    cvs[0].width = w * devicePixelRatio;
    cvs[0].height = h * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    draw();
});

$(window).resize();

$(document).mousedown(ev => {
    dx = preMx = ev.clientX, dy = preMy = ev.clientY;
    drawMode = DrawMode.SELECT;
    // 点击的点不在编辑元素的区域里 清掉编辑状态
    if (editGraph && !judgePointInRect(editGraph, dx, dy)) {
        editGraph = null;
        $("body").attr("class", "");
    }

    // 判断当前点击的点是否是在页面中的某个元素身上
    if (!editGraph) selectGraph(cvs, ctx,true);

    // 点在编辑元素身上
    if (editGraph && judgePointInRect(editGraph, dx, dy)) {
        // 拖拽状态
        let cn = Array.from($("body")[0].classList)[0] || "";
        if (cn == "") {
            $("body").addClass("cursor-drag");
            drawMode = DrawMode.DRAG;
        }else{
            // 拉伸状态
            drawMode = DrawMode[{
                "cursor-lt": "STERTCHLT", 
                "cursor-rt": "STERTCHRT", 
                "cursor-rb": "STERTCHRB", 
                "cursor-lb": "STERTCHLB",
                "cursor-t": "STERTCHT", 
                "cursor-r": "STERTCHR", 
                "cursor-b": "STERTCHB", 
                "cursor-l": "STERTCHL"
            }[cn]];
        }
    }
});

$(document).mousemove(ev => {
    mx = ev.clientX, my = ev.clientY;
    switch (drawMode) {
        case DrawMode.SELECT: drawSelectRect(dx, dy, mx, my, cvs, ctx);break;
        case DrawMode.DRAG: dragRect(preMx, preMy, mx, my);break;
        case DrawMode.STERTCHL: stertchHorV(mx,"x");break;
        case DrawMode.STERTCHR: stertchHorV(mx,"x1");break;
        case DrawMode.STERTCHT: stertchHorV(my,"y");break;
        case DrawMode.STERTCHB: stertchHorV(my,"y1");break;
        case DrawMode.STERTCHLT: stertchBevel(mx,my,"x","y");break;
        case DrawMode.STERTCHRT: stertchBevel(mx,my,"x1","y");break;
        case DrawMode.STERTCHLB: stertchBevel(mx,my,"x","y1");break;
        case DrawMode.STERTCHRB: stertchBevel(mx,my,"x1","y1");break;
    }

    // 编辑状态 且不是拖拽
    if (editGraph && ![DrawMode.DRAG].includes(drawMode)) {
        // 矩形
        if (editGraph.type === GraphType.RECT) {
            $("body").attr("class", "");
            let { x, y, x1, y1 } = editGraph, r = globalConfig.graphEditConnerRadius;
            if (![[x, y], [x1, y], [x1, y1], [x, y1]].some(([x, y], i) => {
                if (mx >= x - r && mx <= x + r && my >= y - r && my <= y + r) {
                    $("body").addClass(["cursor-lt", "cursor-rt", "cursor-rb", "cursor-lb"][i]);
                    return true;
                }
                return false;
            })) [
                mx > x + r && mx < x1 - r && my > y - r && my < y + r,
                my > y + r && my < y1 - r && mx > x1 - r && mx < x1 + r,
                mx > x + r && mx < x1 - r && my > y1 - r && my < y1 + r,
                my > y + r && my < y1 - r && mx > x - r && mx < x + r
            ].some((bool, i) => bool && $("body").addClass(["cursor-t", "cursor-r", "cursor-b", "cursor-l"][i]));
        } else {
            // 线
        }
    }
    preMx = mx, preMy = my;
    draw();
});

$(document).mouseup(() => {
    switch (drawMode) {
        case DrawMode.SELECT: selectGraph(cvs, ctx);
    }
    drawMode = null;
    selRect = null;
    if(editGraph){
        swapPoint(editGraph);
        editGraph.children.forEach(graph => swapPoint(graph));
    }
    draw();
});

$(document).on("mousewheel", (ev) => {
    console.log(ev.clientX);
})

$(document).on("contextmenu", (ev) => {
    ev.stopPropagation();
    return false;
});







/**
 * 绘制主函数
 */
function draw() {
    let { width, height } = cvs[0]
    ctx.clearRect(0, 0, width, height);
    graphs.forEach(graph => graph.draw());

    // 当前是选择元素状态 画选择框
    if (selRect) selRect.draw();

    // 编辑状态 且不是拖拽或者拉伸状态显示编辑样式
    if (editGraph && drawMode < 2) editGraph.draw();
}
draw();

/**
 * 选择矩形
 * @param x 
 * @param y 
 * @param x1 
 * @param y1 
 * @param cvs 
 * @param ctx 
 */
function drawSelectRect(x: number, y: number, x1: number, y1: number, cvs: JQuery<HTMLCanvasElement>, ctx: CanvasRenderingContext2D) {
    selRect = new Rect({
        points: [[x,y],[x1,y1]],
        r: 0,
        ctx,
        cvs,
        drawStyle: GraphDrawStyle.STROKEANDFILL,
        strokeStyle: globalConfig.graphEditLineColor,
        fillStyle: "rgba(47,157,254,.05)",
        strokeWidth: .3,
        scale: 1
    });
}

/**
 * 拖拽
 * @param x 
 * @param y 
 * @param x1 
 * @param y1 
 * @returns 
 */
function dragRect(x: number, y: number, x1: number, y1: number) {
    if (!editGraph) return;
    let diffx = x1 - x, diffy = y1 - y;
    editGraph.x += diffx, editGraph.y += diffy;
    editGraph.x1 += diffx, editGraph.y1 += diffy;
    editGraph.children.forEach(child => {
        child.x += diffx, child.x1 += diffx;
        child.y += diffy, child.y1 += diffy
    });
    draw();
}

/**
 * 
 * @param rect 矩形实例
 * @param dx 点击x点
 * @param dy 点击y点
 * @returns 
 */
function judgePointInRect(rect: Graph, dx: number, dy: number) {
    const { x, y, x1, y1 } = rect, minx = Math.min(x, x1), maxx = Math.max(x, x1), miny = Math.min(y, y1), maxy = Math.max(y, y1);
    return dx >= minx && dx <= maxx && dy >= miny && dy <= maxy;
}


/**
 * 选择元素方法
 * @param cvs canvas实例
 * @param ctx canvas context
 * @returns 
 */
function selectGraph(cvs: JQuery<HTMLCanvasElement>, ctx: CanvasRenderingContext2D,one: boolean = false) {
    editGraph = null;
    let sw = Math.abs(dx - mx), sh = Math.abs(dy - my)
    let children: Graph[] = graphs.filter(({ x, y, x1, y1 }) => {
        let gw = Math.abs(x1 - x), gh = Math.abs(y - y1);
        let lx = Math.min(dx, mx, x, x1), rx = Math.max(dx, mx, x, x1),
            ly = Math.min(dy, my, y, y1), ry = Math.max(dy, my, y, y1);
        // 两个极点之间的距离小于宽高之和就相交
        return rx - lx <= sw + gw && ry - ly <= sh + gh;
    });
    let n = children.length
    if (n == 0) return;
    if(one){
        children = [children.pop()];
        n = 1;
    }
    let { x: lx, x1: rx, y: ly, y1: ry } = children[0];
    for (let i = 1; i < n; ++i) {
        let { x, x1, y, y1 } = children[i];
        lx = Math.min(lx, x);
        rx = Math.max(rx, x1);
        ly = Math.min(ly, y);
        ry = Math.max(ry, y1);
    }
    // 如果lx和rx相等或者ly和ry相等就是条线，选择样式不一样
    if (lx === rx || ly == ry) {

    } else {
        editGraph = new Rect({
            points: [[lx,ly],[rx,ry]],
            cvs,
            ctx,
            r: 0,
            state: RectState.EDIT,
            strokeStyle: globalConfig.graphEditLineColor,
            strokeWidth: globalConfig.graphEditLineWidth,
            drawStyle: GraphDrawStyle.STROKE,
            children
        });
    }
}



/**  拉伸代码  */

/**
 * 单方向拉伸
 * @param val 当前方向的值 
 * @param k 方向k
 */
function stertchHorV(val: number,k: "x" | "x1" | "y" | "y1"){
    const originData = JSON.parse(JSON.stringify(editGraph));
    editGraph[k] = val;
    let dir = k.slice(0,1);
    editGraph.children.forEach(graph => {
        graph[dir] = (graph[dir] - originData[dir]) / (originData[dir + "1"] - originData[dir]) * (editGraph[dir + "1"] - editGraph[dir]) + editGraph[dir];
        graph[dir + "1"] = editGraph[dir + "1"] - (originData[dir + "1"] - graph[dir + "1"]) / (originData[dir + "1"] - originData[dir]) * (editGraph[dir + "1"] - editGraph[dir]);
    });
    draw();
}

/**
 * 斜角拉伸
 * @param mx 移动x点
 * @param my 移动y点
 * @param xk x方向 key
 * @param yk y方向 key
 */
function stertchBevel(mx: number,my: number,xk: "x" | "x1",yk: "y" | "y1"){
    stertchHorV(mx,xk);
    stertchHorV(my,yk);
}


/**
 * 交换坐标位置
 * @param graph 元素
 * @param dir 方向
 */
const swapPoint = (graph: Graph,dir?: "x" | "y") => {
    if(dir)graph[dir] > graph[dir + "1"] && ([graph[dir],graph[dir + "1"]] = [graph[dir + "1"],graph[dir]])
    else{
        swapPoint(graph,"x");
        swapPoint(graph,"y");
    }
};


