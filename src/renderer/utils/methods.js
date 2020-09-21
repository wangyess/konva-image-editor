export const cloneOf = (obj) => {
    return JSON.parse(JSON.stringify(obj));
}

export const setScope = (viewArea, initImg, scale, xscale, yscale, pots) => {
    let { offsetWidth, offsetHeight } = viewArea
    let { width, height } = initImg
    let { x, y } = pots

    width = width * scale * xscale
    height = height * scale * yscale

    let padding = 0

    // 宽高都小于offset 宽高

    // debugger

    if (offsetWidth > width && offsetHeight > height) {
        let a = offsetWidth - width 
        let b = offsetHeight - height 
        if ( x < 10 ) x = 10
        if ( x > (a - 10) ) x = a - 10
        if ( y < 10 ) y = 10
        if (y > (b - 10)) y = (b - 10)

    } else if (offsetWidth > width || offsetHeight > height) {

        if (offsetHeight < height) {
            let a = offsetWidth - width
            let b = offsetHeight - height
            if (x < 10) x = 10
            if (x > (a - 10)) x = a - 10

            if (y > 10) y = 10
            if (y < (b - 10)) y = b - 10

        } else {
            let a = offsetWidth - width
            let b = offsetHeight - height
            if (x > 10) x = 10
            if (x < (a - 10)) x = a - 10
            if (y < 10) y = 10
            if (y > ( b - 10) ) y = b - 10

        }
    } else {

        let a = offsetWidth - width
        let b = offsetHeight - height
        if (x > 10) x = 10
        if (x < (a - 10)) x = a - 10
        if (y > 10) y = 10
        if (y < (b - 10)) y = b - 10
        
    }


    return {
        x,
        y,
    }




}