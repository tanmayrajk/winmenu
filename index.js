import sdl from "@kmamal/sdl";
import { createCanvas } from "@napi-rs/canvas";

const arr = ["apple", "banana", "cherry", "date"]
let selected = 0;
let inputValue = "";

const window = sdl.video.createWindow({ title: "Hello, SDL!", borderless: true });
const { pixelWidth: width, pixelHeight: height } = window;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

ctx.fillStyle = "blue";
ctx.fillRect(0, 0, width, height);

ctx.fillStyle = "darkblue";
ctx.fillRect(15, 15, width - 30, 55);

arr.forEach((item, index) => {
    ctx.fillStyle = index === selected ? "yellow" : "white";
    ctx.font = "20px sans-serif";
    ctx.fillText(item, 15, 100 + index * 30);
})

window.on("keyDown", (e) => {
    if (e.key === "down") {
        selected = (selected + 1) % arr.length;
    } else if (e.key === "up") {
        selected = (selected - 1 + arr.length) % arr.length;
    }

    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "darkblue";
    ctx.fillRect(15, 15, width - 30, 55);

    ctx.fillStyle = "lightblue";
    ctx.font = "30px sans-serif";
    ctx.fillText(inputValue, 20, 55);

    arr.forEach((item, index) => {
        ctx.fillStyle = index === selected ? "yellow" : "white";
        ctx.font = "20px sans-serif";
        ctx.fillText(item, 15, 100 + index * 30);
    })

    const buffer = Buffer.from(ctx.getImageData(0, 0, width, height).data);
    window.render(width, height, width * 4, 'rgba32', buffer);
})


const buffer = Buffer.from(ctx.getImageData(0, 0, width, height).data);
window.render(width, height, width * 4, 'rgba32', buffer);

// window.on('*', console.log);