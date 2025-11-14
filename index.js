import sdl from "@kmamal/sdl";

const window = sdl.video.createWindow({ title: "Hello, SDL!" });
window.on('*', console.log);