let menuMap: Map<string, HTMLDivElement> = new Map();
/**
 * 创建右击菜单项
 * @param title 菜单title
 * @param clickfn 点击事件
 * @param reset 是否重新创建
 * @returns 
 */
export const createMenu = (title: string, clickfn: Function, reset: boolean = false): HTMLDivElement => {
    let menu: HTMLDivElement | undefined = menuMap.get(title);
    if (!menu || reset) {
        menu = document.createElement("div");
        menu.classList.add("menu");
        $(menu).text(title);
        menuMap.set(title, menu);
    }
    $(menu).click(clickfn.bind(menu));
    $(menu).mouseup(ev => ev.stopPropagation()).mousemove(ev => ev.stopPropagation());
    return menu;
}

/**
 * 显示菜单
 * @param rect 当前操作的rect
 * @param titles 所有的
 * @param top 
 * @param left 
 */
export const showMenu = (menus: Menu[], top: number, left: number) => {
    let menuEl = $(".context-menu")
    menuEl.empty();
    console.log(menus);
    menus.sort((a, b) => a.sort - b.sort).forEach(menu => menuEl.append(createMenu(menu.title, menu.cb)))
    menuEl.css({
        display: "block",
        left,
        top
    })
}