/* 角度转弧度 */
export const degToArc = (n: number) => n / 180 * Math.PI;

/* 响应式缩放像素 */
export const scalePx = (num: number) => num * $(window).width() / 1440

export const enlargePx = (num: number)  => num * 1440 / $(window).width()