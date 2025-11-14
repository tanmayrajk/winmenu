import sdl from '@kmamal/sdl';
import { createCanvas, Path2D } from '@napi-rs/canvas';

const inputVal = "chrome1234ABCD!@chrome1234ABCD!@chrome1234ABCD!@chrome1234ABCD!@chrome1234ABCD!@chrome1234ABCD!@"
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
console.log(width - 10)

function render() {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    let inputBox = new Path2D();
    inputBox.rect(5, 5, width - 10, 40);
    ctx.clip(inputBox);

    ctx.fillStyle = "darkblue";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "lightblue";
    ctx.font = "30px Cascadia Mono";
    const coveredTextWidth = charLength * cursorPos;
    let offset = 0;
    const inputWidth = width - 15;
    if (coveredTextWidth > inputWidth) {
        offset = coveredTextWidth - inputWidth;
    }
    console.log({
        coveredTextWidth, cursorPos, offset, textOffset: 10 - Math.abs(offset)
    })
    ctx.fillText(inputVal, 10 - Math.abs(offset), 35);

    ctx.restore();

    if (isCursorVisible) {
        ctx.font = "30px Cascadia Mono";
        ctx.fillStyle = "yellow";
        ctx.fillRect(9 + ctx.measureText(cursorStr).width, 8, 2, 34)
    }

    const buffer = Buffer.from(ctx.getImageData(0, 0, width, height).data);
    window.render(width, height, width * 4, 'rgba32', buffer);
}

render();

window.on("keyDown", e => {
    if (e.key === "right" && cursorPos < inputVal.length) {
        cursorPos += 1;
    } else if (e.key === "left" && cursorPos >= 1) {
        cursorPos -= 1;
    }

    if (e.key === "escape") {
        window.destroyGently();
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

