const DEFAULTS = { rotateKey: "q", resetKey: "r" };
const ACTIONS = { rotateKey: "rotate", resetKey: "reset" };
const BLOCKED = new Set(["Tab", "Enter", " ", "Backspace"]);
const IGNORED = new Set([
    "Shift", "Control", "Alt", "AltGraph", "Meta",
    "CapsLock", "Dead", "Process", "Unidentified"
]);
const ARROWS = {
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→"
};

const buttons = {
    rotateKey: document.getElementById("rotateKey"),
    resetKey: document.getElementById("resetKey")
};
const message = document.getElementById("message");

let settings = { ...DEFAULTS };
let capturing = null;

function label(key) {
    if (key.length === 1) {
        return key.toUpperCase();
    }

    return ARROWS[key] || key;
}

function showMessage(text, isError) {
    message.textContent = text;
    message.className = isError ? "message error" : "message";
}

function render() {
    for (const name in buttons) {
        const listening = capturing === name;
        buttons[name].textContent = listening ? "Press a key" : label(settings[name]);
        buttons[name].classList.toggle("listening", listening);
    }
}

function save(changes) {
    settings = { ...settings, ...changes };
    chrome.storage.local.set(changes, function () {
        showMessage("Saved", false);
    });
    render();
}

for (const name in buttons) {
    buttons[name].addEventListener("click", function () {
        capturing = name;
        showMessage("", false);
        render();
    });
}

document.addEventListener("keydown", function (event) {
    if (!capturing) {
        return;
    }

    event.preventDefault();

    if (event.key === "Escape") {
        capturing = null;
        render();
        return;
    }

    if (IGNORED.has(event.key)) {
        return;
    }

    if (event.ctrlKey || event.altKey || event.metaKey) {
        showMessage("Use a single key, without Ctrl, Alt or Cmd.", true);
        return;
    }

    if (BLOCKED.has(event.key)) {
        showMessage("That key can't be used. Pick another one.", true);
        return;
    }

    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const other = capturing === "rotateKey" ? "resetKey" : "rotateKey";

    if (settings[other] === key) {
        showMessage("That key is already used to " + ACTIONS[other] + ".", true);
        return;
    }

    const name = capturing;
    capturing = null;
    save({ [name]: key });
});

document.getElementById("defaults").addEventListener("click", function () {
    capturing = null;
    save({ ...DEFAULTS });
});

chrome.storage.local.get(DEFAULTS, function (stored) {
    settings = stored;
    render();
});

render();