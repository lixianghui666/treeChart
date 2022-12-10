export enum ParallelHorizationType {
    TOP,
    CENTER,
    BOTTOM
};

export enum ParallerVerticalType {
    LEFT,
    CENTER,
    RIGHT
}

// 事件类型
export enum EventType{
    CONTEXTMENU,
    MOUSEDOWN,
    MOUSEMOVE,
    MOUSEUP
}


/**
 * 矩形状态
 */
export enum RectState{
    DEFAULT,// 正常
    EDIT,// 编辑状态
}

/**
 * 描边类型
 */
export enum StrokeBorderType{
    DASHED,
    SOLID,
}

/**
 * 
 */
export enum GraphDrawStyle{
    STROKE,// 描边
    FILL,// 填充
    STROKEANDFILL// 描边和填充
}

/**
 * 
 */
export enum DrawMode{
    SELECT,
    DRAG,
    STERTCHLT,
    STERTCHRT,
    STERTCHLB,
    STERTCHRB,
    STERTCHT,
    STERTCHB,
    STERTCHL,
    STERTCHR
}

/**
 * 元素类型
 */
export enum GraphType{
    RECT,
    LINE,
    CIRCLE,
    TEXT
}

