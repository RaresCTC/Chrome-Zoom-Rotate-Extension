let activeImage = null;

let rotation = 0;
let zoom = 1;

let panX = 0;
let panY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;


document.addEventListener("mousemove", function(event) {
    if (event.target.tagName === "IMG") {
        activeImage = event.target;
    }
});



document.addEventListener("keydown", function(event) {

    if (event.key.toLowerCase() === "q" && activeImage) {

        rotation += 90;

        if (rotation >= 360) {
            rotation = 0;
        }

        updateImage();
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

    
    const rect = activeImage.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

   
    panX -= mouseX * (zoom - oldZoom);
    panY -= mouseY * (zoom - oldZoom);

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

    activeImage.style.cursor = "grabbing";

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

        if (activeImage) {
            activeImage.style.cursor = zoom > 1 ? "grab" : "default";
        }
    }
});

function updateImage() {

    if (!activeImage) {
        return;
    }

    // Make the top-left corner the point of transformation
    activeImage.style.transformOrigin = "0 0";

    activeImage.style.transform =
        `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`;

    activeImage.style.cursor =
        zoom > 1 ? "grab" : "default";
}