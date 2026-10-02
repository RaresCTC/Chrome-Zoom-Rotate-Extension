let activeImage = null;

let rotation = 0;
let zoom = 1;

let panX = 0;
let panY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;
let moved = false;

const isImageDocument = document.contentType.startsWith("image/");

document.addEventListener("mousemove", function (event) {
    if (event.target.tagName === "IMG") {
        activeImage = event.target;
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key.toLowerCase() === "q" && activeImage) {
        rotation += 90;

        if (rotation >= 360) {
            rotation = 0;
        }

        updateImage();
    }
});

document.addEventListener("wheel", function (event) {
    if (event.target.tagName !== "IMG") {
        return;
    }

    activeImage = event.target;

    if (zoom <= 1 && event.deltaY > 0) {
        return;
    }

    event.preventDefault();

    const oldZoom = zoom;

    if (event.deltaY < 0) {
        zoom += 0.1;
    } else {
        zoom -= 0.1;
    }

    zoom = Math.max(1, Math.min(5, zoom));

    const currentTransform = activeImage.style.transform;
    activeImage.style.transform = "none";
    const base = activeImage.getBoundingClientRect();
    activeImage.style.transform = currentTransform;

    const centerX = base.left + base.width / 2;
    const centerY = base.top + base.height / 2;

    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;

    const ratio = zoom / oldZoom;
    panX = dx - ratio * (dx - panX);
    panY = dy - ratio * (dy - panY);

    if (zoom === 1) {
        panX = 0;
        panY = 0;
    }

    updateImage();
}, { passive: false });

document.addEventListener("mousedown", function (event) {
    if (event.button !== 0) {
        return;
    }

    if (event.target.tagName !== "IMG") {
        return;
    }

    activeImage = event.target;
    isDragging = true;
    moved = false;

    startX = event.clientX;
    startY = event.clientY;

    activeImage.style.cursor = "grabbing";

    event.preventDefault();
});

document.addEventListener("mousemove", function (event) {
    if (!isDragging) {
        return;
    }

    moved = true;

    panX += event.clientX - startX;
    panY += event.clientY - startY;

    startX = event.clientX;
    startY = event.clientY;

    updateImage();
});

document.addEventListener("mouseup", function (event) {
    if (event.button === 0) {
        isDragging = false;

        if (activeImage) {
            activeImage.style.cursor = zoom > 1 ? "grab" : "default";
        }
    }
});

document.addEventListener("click", function (event) {
    if (event.target.tagName !== "IMG") {
        return;
    }

    if (isImageDocument || moved) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    moved = false;
}, true);

function updateImage() {
    if (!activeImage) {
        return;
    }

    activeImage.style.transformOrigin = "center center";

    activeImage.style.transform =
        `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`;

    if (!isDragging) {
        activeImage.style.cursor = zoom > 1 ? "grab" : "default";
    }
}