let activeImage = null;
let rotation = 0;
let zoom = 1;

document.addEventListener("mousemove", function(event) {
    if (event.target.tagName === "IMG") {
        activeImage = event.target;
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key.toLowerCase() === "q") {
        if (activeImage) {
            rotation += 90;

            if (rotation >= 360) {
                rotation = 0;
            }
            activeImage.style.transform = `rotate(${rotation}deg) scale(${zoom})`;
        }
    }
});

document.addEventListener("wheel", function(event) {
    if (event.target.tagName === "IMG") {

        event.preventDefault();

        if (event.deltaY < 0) {
            zoom += 0.1;
        } else {
            zoom -= 0.1;
        }

        if (zoom < 0.2) {
            zoom = 0.2;
        }

        if (zoom > 5) {
            zoom = 5;
        }

        activeImage.style.transform = `rotate(${rotation}deg) scale(${zoom})`;
    }
}, { passive: false });