let activeImage = null;

let rotation = 0;
let zoom = 1;

let panX = 0;
let panY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;
let moved = false;

let rotateKey = "q";
let resetKey = "r";

const isImageDocument = document.contentType.startsWith("image/");

if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.get({ rotateKey: "q", resetKey: "r" }, function (settings) {
        rotateKey = settings.rotateKey;
        resetKey = settings.resetKey;
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== "local") {
            return;
        }

        if (changes.rotateKey) {
            rotateKey = changes.rotateKey.newValue;
        }

        if (changes.resetKey) {
            resetKey = changes.resetKey.newValue;
        }
    });
}

document.addEventListener("mousemove", function (event) {
    if (event.target.tagName === "IMG") {
        activeImage = event.target;
    }
});

document.addEventListener("keydown", function (event) {
    if (!activeImage) {
        return;
    }

    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const isRotate = key === rotateKey;
    const isReset = key === resetKey;

    if (!isRotate && !isReset) {
        return;
    }

    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    const target = event.target;
    const isTyping =
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";

    if (isTyping) {
        return;
    }

    if (isRotate) {
        rotation = (rotation + 90) % 360;
        updateImage();
    } else {
        resetImage();
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

    let delta = event.deltaY;

    if (event.deltaMode === 1) {
        delta *= 33;
    } else if (event.deltaMode === 2) {
        delta *= 400;
    }

    delta = Math.max(-300, Math.min(300, delta));

    const oldZoom = zoom;
    zoom = Math.max(1, Math.min(5, zoom * Math.exp(-delta * 0.001)));

    const rect = activeImage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 - panX;
    const centerY = rect.top + rect.height / 2 - panY;

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

function resetImage() {
    rotation = 0;
    zoom = 1;
    panX = 0;
    panY = 0;
    isDragging = false;

    if (activeImage) {
        activeImage.style.transform = "";
        activeImage.style.transformOrigin = "";
        activeImage.style.cursor = "default";
    }
}

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