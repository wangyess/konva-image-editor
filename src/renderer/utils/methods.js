export const cloneOf = (obj) => {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * stage : scale
 * group : width height Xscale Yscale x, y
 * degrees: rotation
 * 计算当前图片左上角坐标 配合 calculateInitPosition 一起用
 */
export const calculateLeftTopPosition = (width, height, scale, Xscale, Yscale, rotation, x, y) => {
    let lx = x
    let ly = y

    let lw = width = width * Xscale * scale
    let lh = height = height * Yscale * scale

    if (rotation) {
        if (rotation === 180 || rotation === -180) {
            lx = x - width
            ly = y - height
            lw = width
            lh = height

        } else if (rotation === 270 || rotation === -90) {
            lx = x
            ly = y - width
            lw = height
            lh = width

        } else if (rotation === 90 || rotation === -270) {
            lx = x - height
            ly = y
            lw = height
            lh = width
        }

    }

    return {
        lx,
        ly,
        lw,
        lh
    }

}

/**
 * 计算原始位置
 * 例如: 初始  x; 80 y: 20  旋转 90度  x = x + height  y 不变
 * calculateLeftTopPosition 方法无论旋转缩放 计算的都是当前坐上角坐标
 * calculateInitPosition 方法就是获取原始坐标  根据当前左上角坐标 和宽高 旋转角度 求出原始坐标
 */
const calculateInitPosition = (rotation, x, y, width, height) => {
    let lx = x
    let ly = y

    if (rotation) {
        if (rotation === 180 || rotation === -180) {
            lx = x + width
            ly = y + height

        } else if (rotation === 270 || rotation === -90) {
            lx = x
            ly = y + height
        } else if (rotation === 90 || rotation === -270) {
            lx = x + width
            ly = y
        }
    }

    return {
        lx,
        ly
    }
}

/**
 * 设置拖动限制
 */
export const setScope = (viewArea, group, scale, pots, rotation) => {
    let { offsetWidth, offsetHeight } = viewArea
    let { width, height, Xscale, Yscale } = group
    let { x, y } = pots

    let params = calculateLeftTopPosition(width, height, scale, Xscale, Yscale, rotation, x, y)

    x = params.lx
    y = params.ly
    width = params.lw
    height = params.lh

    let padding = 10

    // 宽高都小于offset 宽高

    // debugger

    if (offsetWidth > width && offsetHeight > height) {
        let a = offsetWidth - width
        let b = offsetHeight - height
        if (x < padding) x = padding
        if (x > (a - padding)) x = a - padding
        if (y < padding) y = padding
        if (y > (b - padding)) y = (b - padding)

    } else if (offsetWidth > width || offsetHeight > height) {

        if (offsetHeight < height) {
            let a = offsetWidth - width
            let b = offsetHeight - height
            if (x < padding) x = padding
            if (x > (a - padding)) x = a - padding

            if (y > padding) y = padding
            if (y < (b - padding)) y = b - padding

        } else {
            let a = offsetWidth - width
            let b = offsetHeight - height
            if (x > padding) x = padding
            if (x < (a - padding)) x = a - padding
            if (y < padding) y = padding
            if (y > (b - padding)) y = b - padding

        }
    } else {

        let a = offsetWidth - width
        let b = offsetHeight - height
        if (x > padding) x = padding
        if (x < (a - padding)) x = a - padding
        if (y > padding) y = padding
        if (y < (b - padding)) y = b - padding

    }


    let initParams = calculateInitPosition(rotation, x, y, width, height)
    x = initParams.lx
    y = initParams.ly

    return {
        x,
        y,
    }
}
