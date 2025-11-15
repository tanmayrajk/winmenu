import sdl from '@kmamal/sdl';
import { createCanvas, Path2D } from '@napi-rs/canvas';

const font = "Cascadia Mono"
const fontSize = "25px"

const paddingX = 10
const paddingY = 10

let inputVal = ""
let cursorPos = 0
let cursorStr = ""
let lastResetTime = Date.now();
const cusorResetDuration = 350;
let isCursorVisible = true;
let selection = {
    start: 0, end: 0
}

let charLength = 0;

const window = sdl.video.createWindow({ title: "input box", borderless: true, height: 50 });
const { pixelWidth: width, pixelHeight: height } = window;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

ctx.font = `${fontSize} ${font}`;
charLength = ctx.measureText("a").width;

console.log(cursorPos)

function render() {
    ctx.fillStyle = "#1c1c1c";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#1c1c1c";
    ctx.fillRect(paddingX, paddingY, width - paddingX * 2, height - paddingY * 2);

    ctx.save();

    let inputBox = new Path2D();
    inputBox.rect(paddingX, paddingY, width - paddingX * 2, height - paddingY * 2);
    ctx.clip(inputBox);

    ctx.fillStyle = "#ffffff";
    ctx.font = `${fontSize} ${font}`;
    const coveredTextWidth = charLength * cursorPos;
    let offset = 0;
    const inputWidth = width - paddingX * 2;
    if (coveredTextWidth > inputWidth) {
        offset = coveredTextWidth - inputWidth;
    }
    ctx.fillText(inputVal, paddingX - Math.abs(offset), 35);

    ctx.restore();

    if (isCursorVisible) {
        ctx.font = `${fontSize} ${font}`;
        ctx.fillStyle = "#dddddd";
        ctx.fillRect(paddingX + ctx.measureText(cursorStr).width - offset, 8, 1, 34)
    }

    ctx.fillStyle = "#444444"
    const selectionWidth = charLength * (selection.end - selection.start);
    const selectionLeftWidth = charLength * selection.start;
    ctx.fillRect(paddingX + selectionLeftWidth + offset, paddingY, selectionWidth, height - paddingY * 2)
    ctx.fillStyle = "#ffffff";
    ctx.font = `${fontSize} ${font}`;
    ctx.fillText(inputVal, paddingX - Math.abs(offset), 35);

    const buffer = Buffer.from(ctx.getImageData(0, 0, width, height).data);
    window.render(width, height, width * 4, 'rgba32', buffer);
}

render();

window.on("textInput", e => {
    if (e.text === " ") {
        inputVal = inputVal.slice(0, cursorPos) + e.text + inputVal.slice(cursorPos);
        cursorPos += 1
    }

    if (/^[a-zA-Z0-9]$/.test(e.text)) {
        inputVal = inputVal.slice(0, cursorPos) + e.text + inputVal.slice(cursorPos);
        cursorPos += 1
    }

    if (/^[\p{P}\p{S}]$/u.test(e.text)) {
        inputVal = inputVal.slice(0, cursorPos) + e.text + inputVal.slice(cursorPos);
        cursorPos += 1
    }

    cursorStr = inputVal.slice(0, cursorPos);
    isCursorVisible = true;
    lastResetTime = Date.now();

    render();
})

window.on("keyDown", e => {
    if (e.key === "right") {
        if (e.shift) {
            if (cursorPos + 1 <= inputVal.length) {
                if (selection.start === selection.end) {
                    selection.start = cursorPos
                    selection.end = cursorPos + 1
                } else if (selection.start < cursorPos) {
                    selection.end += 1
                } else if (selection.end > cursorPos) {
                    selection.start += 1
                }
            }
            if (cursorPos < inputVal.length) cursorPos += 1
        } else {
            if (cursorPos < inputVal.length && selection.start === selection.end) {
                cursorPos += 1;
            }
            selection = { start: 0, end: 0 }
        }
    } else if (e.key === "left") {
        if (e.shift) {
            if (cursorPos - 1 >= 0) {
                if (selection.start === selection.end) {
                    selection.start = cursorPos - 1
                    selection.end = cursorPos
                } else if (selection.end > cursorPos) {
                    selection.start -= 1;
                } else if (selection.start < cursorPos) {
                    selection.end -= 1;
                }
            }
            if (cursorPos >= 1) cursorPos -= 1;
        } else {
            if (cursorPos >= 1 && selection.start === selection.end) cursorPos -= 1;
            selection = { start: 0, end: 0 }
        }


    }

    if (selection.end === selection.start) {
        selection = { start: 0, end: 0 }
    }

    if (e.key === "escape") {
        window.destroyGently();
    }

    if (e.key == "backspace") {
        if (selection.start > 0 || selection.end > 0) {
            inputVal = inputVal.slice(0, selection.start) + inputVal.slice(selection.end)
            cursorPos = selection.start
            selection = { start: 0, end: 0 }
        } else if (cursorPos != 0) {
            inputVal = inputVal.slice(0, cursorPos - 1) + inputVal.slice(cursorPos)
            cursorPos -= 1;
        }
    }

    if (e.key === "delete") {
        if (selection.start > 0 || selection.end > 0) {
            inputVal = inputVal.slice(0, selection.start) + inputVal.slice(selection.end)
            cursorPos = selection.start
            selection = { start: 0, end: 0 }
        } else if (cursorPos != inputVal.length) {
            inputVal = inputVal.slice(0, cursorPos) + inputVal.slice(cursorPos + 1)
        }
    }

    if (e.key === "a" && e.ctrl) {
        selection.start = 0
        selection.end = inputVal.length;
        cursorPos = inputVal.length;
    }

    if (e.key === "x" && e.ctrl) {
        const selectionText = inputVal.slice(selection.start, selection.end);
        sdl.clipboard.setText(selectionText)
        inputVal = inputVal.slice(0, selection.start) + inputVal.slice(selection.end)
        cursorPos = selection.start
        selection = { start: 0, end: 0 }
    }

    if (e.key === "c" && e.ctrl) {
        const selectionText = inputVal.slice(selection.start, selection.end + 1);
        sdl.clipboard.setText(selectionText)
    }

    if (e.key === "v" && e.ctrl) {
        inputVal = inputVal.slice(0, selection.start) + inputVal.slice(selection.end)
        const cbText = sdl.clipboard.text
        inputVal = inputVal.slice(0, cursorPos) + cbText + inputVal.slice(cursorPos)
        cursorPos += cbText.length
        selection = { start: 0, end: 0 }
    }

    cursorStr = inputVal.slice(0, cursorPos);
    isCursorVisible = true;
    lastResetTime = Date.now();

    render();
})

setInterval(() => {
    if (Date.now() >= cusorResetDuration + lastResetTime) {
        isCursorVisible = !isCursorVisible;
        render();
    }
}, cusorResetDuration)

