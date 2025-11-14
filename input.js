import sdl from '@kmamal/sdl';
import { createCanvas, Path2D } from '@napi-rs/canvas';

const inputVal = "chromechromechromechromechromechromechromechromechromechromechromechromechromechromechromechromechromechrome"
let cursorPos = 0
let cursorStr = ""

const window = sdl.video.createWindow({ title: "Hello, SDL!", borderless: true, height: 50 });
const { pixelWidth: width, pixelHeight: height } = window;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

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
    ctx.fillText(inputVal, 10, 35);

    ctx.restore();

    ctx.font = "30px Cascadia Mono";

    ctx.fillStyle = "yellow";
    ctx.fillRect(9 + ctx.measureText(cursorStr).width, 8, 2, 34)

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

    cursorStr = inputVal.slice(0, cursorPos);
    render();
})