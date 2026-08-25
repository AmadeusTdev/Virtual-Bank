const fileName = "VBankMonitorData.json"

// Electron pour Windows et Capacitor pour Android
function getPlatform() {
    // Windows
    if (window.electronAPI) {
        return "windows";
    }
    // Android
    if (window.Capacitor) {
        return window.Capacitor.getPlatform();
    }
    // Web
    return "web";
}

export async function saveFile(content) {
    // demander au système de stockage
    const platform = getPlatform();

    // windows
    if (platform === "windows") {
        await window.electronAPI.saveFile(fileName, content);
        return;
    }
    // android
    if (platform === "android") {
        await saveFileAndroid(fileName, content);
        return;
    }
    // plateforme non supportée
    throw new Error(
        "Plateforme non supportée : " + platform
    );
}

export async function loadFile() {
    // demander au système de stockage
    const platform = getPlatform();

    // windows
    if (platform === "windows") {
        return await window.electronAPI.loadFile(fileName);
    }
    // android
    if (platform === "android") {
        return await loadFileAndroid(fileName);
    }
    // web (pour dev l'application)
    if (platform === "web") {
        return null
    }

    // plateforme non supportée
    throw new Error(
        "Plateforme non supportée : " + platform
    );
}

async function saveFileAndroid(filename, content) {
    // Capacitor Filesystem
}
async function loadFileAndroid(filename) {
    // Capacitor Filesystem
}