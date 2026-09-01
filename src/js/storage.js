// Attendre que PyWebView soit complètement initialisé
window.addEventListener('pywebviewready', () => {
    console.log("PyWebView est prêt !");
});

// Fonction pour déclencher le chargement d'un fichier
export async function loadFile() {
    try {
        const response = await window.pywebview.api.charger_donnees_auto();
        
        if (response.success) {
            return response.data;
        } else {
            alert("Erreur lors de la lecture : " + response.error);
        }
    } catch (err) {
        console.error("Erreur d'appel API :", err);
    }
}

// Fonction pour déclencher la sauvegarde
export async function saveFile(content) {
    try {
        const response = await window.pywebview.api.sauvegarder_donnees_auto(content);
        
        if (response.success) {
            //alert("Fichier enregistré sous : " + response.path); --// On n'a pas besoin d'informer l'utilisateur que le fichier a été sauvegardé, car il est sauvegardé automatiquement.
        } else {
            alert("Erreur lors de la sauvegarde : " + response.error);
        }
    } catch (err) {
        console.error("Erreur d'appel API :", err);
    }
}

async function saveFileAndroid(filename, content) {
    // Capacitor Filesystem
}
async function loadFileAndroid(filename) {
    // Capacitor Filesystem
}