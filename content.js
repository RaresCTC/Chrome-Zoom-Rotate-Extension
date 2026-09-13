let activeImage = null;

let rotation = 0;
let zoom = 1;

let isDragging = false;
let startX = 0;
let startY = 0;

let panX = 0;
let panY = 0;



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

            updateImage();
        }
    }
});



document.addEventListener("wheel", function(event) {

    if (event.target.tagName !== "IMG") {
        return;
    }

    event.preventDefault();

    activeImage = event.target;

    const oldZoom = zoom;

    if (event.deltaY < 0) {
        zoom += 0.1;
    } else {
        zoom -= 0.1;
    }

    zoom = Math.max(0.2, Math.min(5, zoom));

    // Keep the point underneath the cursor in the same place
    const rect = activeImage.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    panX -= mouseX * (zoom / oldZoom - 1);
    panY -= mouseY * (zoom / oldZoom - 1);

    updateImage();

}, { passive: false });



document.addEventListener("mousedown", function(event) {

    if (event.button !== 0) {
        return;
    }

    if (event.target.tagName !== "IMG") {
        return;
    }

    activeImage = event.target;

    isDragging = true;

    startX = event.clientX;
    startY = event.clientY;

    event.preventDefault();
});


document.addEventListener("mousemove", function(event) {

    if (!isDragging) {
        return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    panX += deltaX;
    panY += deltaY;

    startX = event.clientX;
    startY = event.clientY;

    updateImage();
});


document.addEventListener("mouseup", function(event) {

    if (event.button === 0) {
        isDragging = false;
    }
});


function updateImage() {

    if (!activeImage) {
        return;
    }

    activeImage.style.transform =
        `translate(${panX}px, ${panY}px) rotate(${rotation}deg) scale(${zoom})`;

    activeImage.style.cursor = zoom > 1 ? "grab" : "default";
}