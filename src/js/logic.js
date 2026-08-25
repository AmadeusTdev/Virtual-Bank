import { saveFile, loadFile } from "./storage.js";

var userData = null; // User data will be loaded here

// Blank data that is used 
var blank_userData = {
    "bankData": {
        "Autres": 10,
        "Logement": 65.15,
    },
    "CategoriesData": [
        "Autres",
        "Logement",
        "Nourriture",
        "Divertissement",
    ], // List of categories
    "EarningsData": {
        "Configs": {
            "Default": [ // Config name, then list of options
                ["Autres", 30, "%"],
                ["Logement", 70, "%"],
                ["Divertissement", 10, "€"],
            ],
            "Arthur": [ // Config name, then list of options
                ["Autres", 30, "%"],
                ["Logement", 70, "%"],
                ["Divertissement", 10, "€"],
                ["Autres", 30, "%"],
            ],
        },
    },
    "SpendingsData": {},
    "ActivityData": {},
};

async function loadUserData() {
    // Load user data
    if (userData == null || userData == "") {
        var gotData = await loadFile();
        // Convert and store data if it's not empty
        if (gotData != null && gotData != "") {
            userData = JSON.parse(gotData);
        }
    }
    // If user data is still empty we load blank one
    if (userData == null || userData == "") {
        userData = blank_userData;
    }
}

export async function getCategoriesData() {
    await loadUserData(); // Load user data if not already loaded
    // Return categories data
    return userData["CategoriesData"];
}
export async function categoriesList_add(categoryName) {
    await loadUserData(); // Load user data if not already loaded
    if (!userData["CategoriesData"].find((element) => element == categoryName)) {
        // Catégorie non trouvée
        userData["CategoriesData"].push(categoryName);
        // Sauvegarde des données

        // Retour du résultat
        return true;
    }
    return false;
}
export async function categoriesList_remove(categoryName) {
    await loadUserData(); // Load user data if not already loaded
    
    const index = userData["CategoriesData"].indexOf(categoryName);
    if (index > -1) {
        // Catégorie trouvée
        userData["CategoriesData"].splice(index, 1) // Remove 1 element at index
        // Sauvegarde des données

        // Retour du résultat
        return true;
    }
}

export async function getEarningsData() {
    await loadUserData(); // Load user data if not already loaded
    // Return earnings data
    return userData["EarningsData"];
}
export async function setEarningsData(earningsData) {
    await loadUserData(); // Load user data if not already loaded

    // Set earnings data
    userData["EarningsData"] = earningsData;
    // Save user data

}

export async function getBankData() {
    await loadUserData() // Load user data if not already loaded
    // Get bank data
    var bankDataGraphic = {
        "labels": [],
        "values": [],
    };
    let total = 0;
    console.log(userData);
    for (const key of Object.keys(userData["bankData"])) {
        bankDataGraphic["labels"].push(key);
        bankDataGraphic["values"].push(userData["bankData"][key]);
        total += userData["bankData"][key];
    }
    // return bank graphic data
    return [bankDataGraphic, total];
}