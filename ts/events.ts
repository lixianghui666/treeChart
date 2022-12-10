/* 创建单个菜单 */
import "./main"
import { scalePx, enlargePx } from "./util"
import { rects as originRects, lines as originLines } from "../chart-data";
import { EventType, GraphDrawStyle, ParallelHorizationType, ParallerVerticalType, RectState } from "./enum";
import { drawLine, drawRectModule, drawSelectRect } from "./draw";
import { showMenu } from "./menu";
import { Rect as Rect1} from "./graph";
console.log(process.env.NODE_ENV)
const getMenuConfig = (rect: Rect, left: number, top: number): Menu[] => [{
    title: "添加元素",
    cb: () => addRect(left, top),
    sort: 1
}, {
    title: "修改配置",
    cb: () => setPopoverState(rect, true),
    sort: 2
}, {
    title: "添加实线",
    cb: () => addLine(rect, "solid"),
    sort: 3
}, {
    title: "添加虚线",
    cb: () => addLine(rect, "dashed"),
    sort: 4
}, {
    title: "编辑线",
    cb: () => editLine(rect),
    sort: 5
}, {
    title: "取消选择",
    cb: () => cancelSelRect([rect]),
    sort: 6
}, {
    title: "选择元素",
    cb: () => selCurRect(rect),
    sort: 7
}, {
    title: "删除线",
    cb: removeLine,
    sort: 8
}, {
    title: "删除元素",
    cb: () => removeRect([rect]),
    sort: 9
}, {
    title: "删除选中元素",
    cb: () => removeRect(curSelRects),
    sort: 10
}];
let rects = originRects, lines = originLines;
const debug: boolean = process.env.NODE_ENV === "development";
(document.querySelector(".context-menu") as HTMLDivElement).onclick = function (ev) {
    ev.stopPropagation();
}

let curRect: Rect | null = null, cpoint: Point | null = null, cvs: JQuery<HTMLCanvasElement> = $(".treeChart"), ctx: CanvasRenderingContext2D = (cvs[0] as HTMLCanvasElement).getContext("2d")!, w: number = $(window).width()!, h: number = $(window).height()!, line: Line | null = null;
let mx: number = 0, my: number = 0, dx: number = 0, dy: number = 0, curSelRects: Rect[] = [];
let l: number = 0, t: number = 0
/* window onresize event hanlder */
function resize() {
    w = $(window).width()!, h = $(window).height()!
    let pixel: number = window.devicePixelRatio || 1
    cvs.attr({
        "width": w * pixel + 'px',
        "height": h * pixel + 'px'
    });
    cvs.css({
        width: w + "px",
        height: h + "px"
    });
    ctx.scale(pixel, pixel);
    if (curRect) setPopoverState(curRect, false)
    draw();
}
window.onresize = window.onload = resize;




/**
  * 两个矩形的极点x点位置之差小于两个宽度只和并且y点也是就想交
 */
function judgeInRect(x, y, w, h, x1, y1, w1, h1) {
    if (Math.abs(x - x1) <= w + w1 && Math.abs(y - y1) <= h + h1) {
        return true;
    }
    return false;
}

/**
 * 根据选择框选中元素
 */
function selElement() {
    if (curRect || cpoint) return;
    rects = rects.map(rect => {
        let { w, h, x, y } = rect, w1 = Math.abs(dx - mx), h1 = Math.abs(dy - my);
        const pointx = [scalePx(x), scalePx(x + w), dx, mx], pointy = [scalePx(y), scalePx(y + h), dy, my];
        if (judgeInRect(Math.min(...pointx), Math.min(...pointy), scalePx(w), scalePx(h), Math.max(...pointx), Math.max(...pointy), w1, h1)) {
            rect.border = true;
            curSelRects.push(rect);
        }
        return rect
    });
}



/* 全局统一渲染 */
function draw() {
    ctx.clearRect(0, 0, cvs.width()!, cvs.height()!)
    lines.forEach(line => drawLine(line, mx, my, dx, dy, rects));
    rects.forEach(rect => drawRectModule(rect, 6));
    drawSelectRect(curRect, cpoint, line, mx, my, dx, dy);
}


/* 判断是否在圆内 */
function judgeInCircle(rx: number, ry: number, r: number, x: number, y: number): boolean {
    return Math.abs(rx - x) < r && Math.abs(ry - y) < r;
}

function removeCurrentLine() {
    if (!line) return;
    let i = 0;
    rects.forEach(item => ((i = item.lines.indexOf(line!.id)) !== -1) && item.lines.splice(i, 1));
    lines = lines.filter(l => l.id !== line!.id);
    line = null;
}

/* 统一隐藏全局菜单栏 */
function hideMenu() {
    $(".context-menu").css("display", "none");
}

/* 添加矩形元素 */
function addRect(x: number, y: number) {
    let id = rects.length + 1;
    while (rects.some(rect => rect.id === id)) id++;
    rects.push({
        id,
        title: "",
        x: enlargePx(x),
        y: enlargePx(y),
        w: 120,
        h: 36,
        textColor: "#444444",
        rectColor: "#ea5355",
        lines: [],
        page: "",
        prev: null,
        next: null,
        parent: null,
        children: [],
        border: false
    });
    hideMenu();
    draw();
}

/* 删除矩形 */
function removeRect(list: Rect[]) {
    if (!list?.length) return;
    // 删除元素和它身上所有的连接点,删除线这块后期优化连接next
    rects = rects.filter(rect => !list.includes(rect));
    let ids: number[] = list.map(rect => {
        return rect.id;
    })
    lines = lines.filter(line => !(ids.includes(line.start) || ids.includes(line.end)));
    // 删除关联关系
    hideMenu();
    draw();
}

/* 添加父子连接点 */
function addLine(rect: Rect, type: LineType = "solid") {
    let id = lines.length;
    while (lines.some(line => line.id === id)) id++;
    // 保存当前线，记录起点
    line = {
        start: rect.id,
        id,
        type,
        dev: false,
        cpoint_end: null,
        cpoint_start: null,
        end: null
    };
    lines.push(line);
    rect.lines.push(line.id);
    draw();
    hideMenu();
}

/* 删除连接点 */
function removeLine() {
    let map = new Map()
    for (let rect of curSelRects) {
        rect.lines.forEach((id, i) => {
            let [preRect, j] = map.get(id) || [];
            if (preRect) {
                preRect.lines.splice(j, 1);
                rect.lines.splice(i, 1);
                lines = lines.filter(line => line.id !== id);
            }
            map.set(id, [rect, i]);
        })
    }
    curSelRects = curSelRects.reduce((pre, rect) => (rect.border = false) || pre, [])
    draw();
    hideMenu();
}

/* 编辑线点 */
function editLine(rect: Rect) {
    lines = lines.map(line => Object.assign(line, {
        dev: rect.lines.includes(line.id)
    }));
    draw();
    hideMenu();
}

interface Menus {
    [k: string]: Menu
}


$(".el-popover").click(ev => ev.stopPropagation());
function hasSameLine(): boolean {
    let map = new Map<number, boolean>();
    for (let rect of curSelRects) {
        for (let id of rect.lines) {
            if (map.has(id)) return true;
            map.set(id, true);
        }
    }
    return false;
}

function createConfirmClickHandler(rect) {
    return ev => {
        ev.stopPropagation();
        Object.assign(rect, {
            title: $(".rect-title").text(),
            rectColor: $(".rect-color").val(),
            textColor: $(".text-color").val(),
            x: Number($(".rect-x").text()),
            y: Number($(".rect-y").text()),
            w: Number($(".rect-w").text()),
            h: Number($(".rect-h").text()),
            page: $(".rect-page").text()
        });
        setPopoverState(rect, false);
        draw();
    }
}



function dealLine() {
    // 不是移动且当前不是画线，把控制点全取消，画完线的时候会显示控制点，所以画线的时候不能取消掉
    if (!cpoint) lines = lines.map(line => Object.assign(line, { dev: false }));
    if (line) {
        // 当前在画线中
        if (curRect) {
            // 点击了一个矩形,线画完了,取消move事件绑定
            $(document).off("mousemove");
            // 画完了
            line.end = curRect.id;
            // 存在相同的线或者线的起点和终点是同一个矩形
            if (line.start === line.end || lines.some(item => item.id !== line!.id && [item.start, item.end].includes(line!.start) && [item.start, item.end].includes(line!.end))) {
                removeCurrentLine();
            } else {
                // 只有开始的元素和结束的元素不同的时候才连接,不然就清掉
                // 设置前后关系
                const preRect: Rect = rects.find(rect => rect.id === line.start);
                curRect.lines.push(line.id);
                // 绑定关系
                if (line.type === "solid") {
                    preRect.next = curRect.id
                    curRect.prev = preRect.id
                } else {
                    preRect.children.push(curRect.id);
                    curRect.parent = preRect.id;
                }
                line.dev = true;
            }
        } else {
            // 点击的地方不是元素,说明选择的是控制点坐标
            if (line.cpoint_end) {
                // 两个控制点都选择了,这是第三个了,直接删这条线
                removeCurrentLine();
            } else if (!line.cpoint_start) {
                // 标记第一个控制点
                line.cpoint_start = { x: enlargePx(dx), y: enlargePx(dy) }
            } else if (!line.cpoint_end) {
                // 标记第二个
                line.cpoint_end = { x: enlargePx(dx), y: enlargePx(dy) };
            }
        }
    }
}

function findCanMoveEl() {
    curRect = cpoint = null;
    // 判断是否点在控制点上
    lines.some(line => {
        if (line.cpoint_start && judgeInCircle(scalePx(line.cpoint_start.x), scalePx(line.cpoint_start.y), scalePx(5), dx, dy) && line.dev) cpoint = line.cpoint_start;
        else if (line.cpoint_end && judgeInCircle(scalePx(line.cpoint_end.x), scalePx(line.cpoint_end.y), scalePx(5), dx, dy) && line.dev) cpoint = line.cpoint_end;
        return cpoint;
    });
    // 判断是否点在矩形上
    if (!cpoint) curRect = rects.findLast(rect => {
        let { x, y, w, h } = rect;
        x = scalePx(x), y = scalePx(y);
        let x2 = scalePx(w) + x, y2 = scalePx(h) + y;
        return dx >= x && dx <= x2 && dy <= y2 && dy >= y;
    });
}



let goPage: NodeJS.Timeout | null = null, preClickTime: number = 0, debounceTime = 300, eventType: EventType;
$(document).on("mousedown", (ev) => {
    console.log("mousedown")
    if (!line) $(document).on("mousemove", canvasMove)
    eventType = EventType.MOUSEDOWN;
    dx = ev.clientX, dy = ev.clientY;
    findCanMoveEl();
    dealLine();
    // 记录点击的时候点击的上方距离和左方距离,移动的时候直接用
    if (curRect) {
        t = dy - scalePx(curRect.y), l = dx - scalePx(curRect.x);
    } else if (cpoint) {
        t = dy - scalePx(cpoint.y), l = dx - scalePx(cpoint.x);
    }
}).on("mouseup", () => {
    console.log("mouseup");
    setPopoverState(curRect!, false);
    cancelSelRect(curSelRects, true);
    const now = Date.now();
    // 双击
    if (now - preClickTime < debounceTime) {
        clearInterval(goPage);
        editTitle(curRect);
    }
    // 点击的是元素且元素身上有跳转的页面且不是移动且不是画线,因为画线也会点击元素
    if (curRect && eventType === EventType.MOUSEDOWN && !line && curRect.page) goPage = setTimeout(() => {
        location.href = location.origin + `/md/${curRect.page}/index.html`;
    }, debounceTime);
    if (mx || my) selElement();
    if (!line) {
        $(document).off("mousemove");
        mx = my = 0;
    }
    preClickTime = now;
    draw();
    if (eventType !== EventType.CONTEXTMENU) hideMenu();
    eventType = EventType.MOUSEUP;
});

(debug && $(document).on("contextmenu", (ev) => {
    eventType = EventType.CONTEXTMENU;
    console.log("contextmenu");
    lines = lines.map(line => Object.assign(line, { dev: false }));
    let { clientX: left, clientY: top } = ev, menuEl = $(".context-menu");
    let menus: Menu[] = [
        true,
        !!curRect,
        !!curRect,
        !!curRect,
        !!curRect?.lines?.length,
        !!(curRect && curSelRects.some(item => item.id === curRect!.id)),
        !!(curRect && curSelRects.every(item => item.id !== curRect!.id)),
        hasSameLine(),
        !!curRect,
        !!curSelRects.length
    ].reduce((pre: Menu[], cur, i) => cur ? [...pre, getMenuConfig(curRect,left,top)[i]] : pre, []);
    if (line) removeCurrentLine();
    let width = menuEl.width()!, height = menuEl.height()!;
    if (left + width > w) left = w - width;
    if (top + height > h) top = h - height;
    showMenu(menus, top, left);
    return false;
}) && $(window).keydown(async (ev) => {
    if (ev.metaKey && ev.code === "KeyS") {
        ev.preventDefault();
        await save();
    }
}));

/* canvas mousemove event hanlder */
function canvasMove(ev) {
    eventType = EventType.MOUSEMOVE;
    mx = ev.clientX, my = ev.clientY;
    if ((curRect || cpoint) && !line) {
        // 只有当前点击的地方有元素或者控制点并且不是画关系线的时候才能进行move
        if (debug) {
            if (curRect) {
                curRect.x = enlargePx(mx - l);
                curRect.y = enlargePx(my - t);
            } else if (cpoint) {
                cpoint.x = enlargePx(mx - l),
                    cpoint.y = enlargePx(my - t);
            }
            draw()
        }
    } else if (line || (dx !== mx && dy !== my)) {
        draw();
    }
}

/* 显示参数编辑弹窗 */
function setPopoverState(rect: Rect, show = true) {
    if (show) {
        $(".rect-title").text(rect.title);
        $(".rect-color").val(rect.rectColor);
        $(".text-color").val(rect.textColor);
        $(".rect-x").text(rect.x);
        $(".rect-y").text(rect.y);
        $(".rect-w").text(rect.w);
        $(".rect-h").text(rect.h);
        $(".rect-page").text(rect.page);
        hideMenu();
        $(".el-popover").css({
            transform: `scale(${w / 1440})`,
            left: scalePx(rect.x) + scalePx(rect.w) / 2 - $(".el-popover").width()! / 2 + "px",
            top: scalePx(rect.y) + scalePx(rect.h) + 10 + "px",
            display: "block"
        });
        $(".confirm").off().click(createConfirmClickHandler(rect));
    } else {
        $(".el-popover").css({ display: "none" })
    }
}

/* 获取编辑参数并渲染绘制 */
function save() {
    return new Promise(resolve => $.ajax("http://localhost:8085/save-data", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        data: JSON.stringify({
            data: encodeURIComponent(`export const rects=${JSON.stringify(rects)};\n\rexport const lines=${JSON.stringify(lines)};`)
        }),
        success: (res) => resolve(res)
    }));
}



/**编辑rect */

function cancelSelRect(rects: Rect[], clear: boolean = false) {
    if (!rects?.length) return;
    curSelRects = curSelRects.filter(rect => !rects.includes(rect));
    rects.filter(rect => rect !== curRect).forEach(rect => rect.border = false);
    if (clear) curSelRects = [];
    if (curRect) curSelRects.push(curRect);
    draw();
    hideMenu();
}

function selCurRect(rect: Rect) {
    if (!rect) return;
    rect.border = true;
    curSelRects.push(rect);
    draw();
    hideMenu();
}


function setParaller(type: ParallelHorizationType | ParallerVerticalType, dir: 'x' | 'y') {
    let min, max
    min = max = curSelRects[0].x;
    for (let rect of curSelRects) {
        min = Math.min(min, rect[dir]);
        max = Math.min(max, rect[dir]);
    }
    curSelRects.forEach(rect => {
        switch (type) {
            case ParallerVerticalType.LEFT: ;
            case ParallelHorizationType.TOP: rect[dir] = min; break;
            case ParallerVerticalType.CENTER: ;
            case ParallelHorizationType.CENTER: rect[dir] = (max + min) / 2; break;
            case ParallerVerticalType.RIGHT: ;
            case ParallelHorizationType.BOTTOM: rect[dir] = max;
        }
    })
    cancelSelRect(curSelRects);
}

function sameHorization(type: ParallelHorizationType = ParallelHorizationType.TOP) {
    setParaller(type, "x");
}

function sameVertical(type: ParallerVerticalType) {
    setParaller(type, "y");
}

function editTitle(rect: Rect) {
    if (!rect) return;
    const { w, h, x, y, title, rectColor, textColor } = rect!;
    const editText = $(".edit_text")
    $(".edit").css({
        width: scalePx(w) + "px",
        height: scalePx(h) + "px",
        left: scalePx(x) + "px",
        top: scalePx(y) + "px",
        background: rectColor,
        color: textColor
    });
    rect.title = "";
    const blurEventCb = () => {
        rect.title = editText.text();
        $(".edit").css({
            width: "0px",
            height: "0px"
        });
        editText.text("");
        editText.off();
        draw();
    }
    editText.css({
        "background": rectColor
    }).text(title).on("blur", blurEventCb).on("click", blurEventCb).focus();
    const range = window.getSelection()
    range.selectAllChildren(editText[0]);
    range.collapseToEnd();
}

