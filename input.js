import sdl from '@kmamal/sdl';
import { createCanvas, Path2D } from '@napi-rs/canvas';

let inputVal = ""
let cursorPos = 0
let cursorStr = ""
let lastResetTime = Date.now();
const cusorResetDuration = 350;
let isCursorVisible = true;

let charLength = 0;

const window = sdl.video.createWindow({ title: "input box", borderless: true, height: 50 });
const { pixelWidth: width, pixelHeight: height } = window;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

ctx.font = "30px Cascadia Mono";
charLength = ctx.measureText("a").width;

console.log(cursorPos)

function render() {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "darkblue";
    ctx.fillRect(5, 5, width - 10, height - 10);

    ctx.save();

    let inputBox = new Path2D();
    inputBox.rect(10, 5, width - 20, 40);
    ctx.clip(inputBox);

    ctx.fillStyle = "lightblue";
    ctx.font = "30px Cascadia Mono";
    const coveredTextWidth = charLength * cursorPos;
    let offset = 0;
    const inputWidth = width - 20;
    if (coveredTextWidth > inputWidth) {
        offset = coveredTextWidth - inputWidth;
    }
    ctx.fillText(inputVal, 10 - Math.abs(offset), 35);

    ctx.restore();

    if (isCursorVisible) {
        ctx.font = "30px Cascadia Mono";
        ctx.fillStyle = "yellow";
        ctx.fillRect(9 + ctx.measureText(cursorStr).width - offset, 8, 2, 34)
    }

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
    if (e.key === "right" && cursorPos < inputVal.length) {
        cursorPos += 1;
    } else if (e.key === "left" && cursorPos >= 1) {
        cursorPos -= 1;
    }

    if (e.key === "escape") {
        window.destroyGently();
    }

    if (e.key == "backspace" && cursorPos != 0) {
        inputVal = inputVal.slice(0, cursorPos - 1) + inputVal.slice(cursorPos)
        cursorPos -= 1;
    }

    if (e.key === "delete" && cursorPos != inputVal.length) {
        inputVal = inputVal.slice(0, cursorPos) + inputVal.slice(cursorPos + 1)
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

