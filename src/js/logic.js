import { saveFile, loadFile } from "./storage.js";

var userData = null; // User data will be loaded here

// Blank data that is used 
var blank_userData = {
    "bankData": {
        "Autres": 0,
    },
    "CategoriesData": [
        "Autres",
        "Logement",
        "Nourriture",
        "Divertissement",
    ], // List of categories
    "EarningsData": {
        "Configs": {},
    },
    "SpendingsData": {},
    "ActivityData": {},
};

//---------------------------------------------------------- LOAD User Data
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

//---------------------------------------------------------- Get / Set / Modify User Data
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
        // Transférer l'argent virtuel de cette catégorie dans "Autres"

        // Retour du résultat
        return true;
    }
    return false;
}

export async function getEarningsData() {
    await loadUserData(); // Load user data if not already loaded
    // Return earnings data
    return userData["EarningsData"];
}
export async function config_option_remove(configName, optionIndex) {
    if (userData["EarningsData"]["Configs"][configName] != null) {
        if (userData["EarningsData"]["Configs"][configName][optionIndex] != null) {
            delete userData["EarningsData"]["Configs"][configName][optionIndex];
            // Retour du résultat
            return true;
        }
    }
    return false;
}
export async function config_option_modify(configName, optionIndex, newValue) {
    if (userData["EarningsData"]["Configs"][configName] != null) {
        userData["EarningsData"]["Configs"][configName][optionIndex] = newValue;
    }
}
export async function config_add(configName) {
    if (userData["EarningsData"]["Configs"][configName] == null) {
        userData["EarningsData"]["Configs"][configName] = {
            "op0": ["Autres", 100, "%"],
        }
        return true;
    }
    return false;
}
export async function config_remove(configName) {
    if (userData["EarningsData"]["Configs"][configName] != null) {
        delete userData["EarningsData"]["Configs"][configName];
        return true;
    }
    return false;
}
export async function config_use(configName, amount) {
    if (userData["EarningsData"]["Configs"][configName] != null) {
        // On vérifie que la configuration à de bonnes options (somme des options % = 100% et somme des options euros <= amount)
        let sommePercentage = 0;
        let sommeEuros = 0;

        for (const option_key of Object.keys(userData["EarningsData"]["Configs"][configName])) {
            const option = userData["EarningsData"]["Configs"][configName][option_key];
            if (option[2] == "%") {
                sommePercentage = sommePercentage + (+option[1]);
            } else if (option[2] == "€") {
                sommeEuros = sommeEuros + (+option[1]);
            }
            console.log(option);
        }

        if (sommePercentage == 100 && sommeEuros <= amount) {
            // L'argent peut être correctement répartis
            for (const option_key of Object.keys(userData["EarningsData"]["Configs"][configName])) {
                const option = userData["EarningsData"]["Configs"][configName][option_key];
                if ( userData["bankData"][option[0]] == null) {
                    userData["bankData"][option[0]] = 0;
                }

                if (option[2] == "%") {
                    userData["bankData"][option[0]] += (+((amount-sommeEuros) * (option[1]/100)));
                } else if (option[2] == "€") {
                    userData["bankData"][option[0]] += (+option[1]);
                }
            }

            return true;
        } else {
            if (sommePercentage != 100) {
                return "La somme des pourcentage n'est pas égale à 100%!";
            } else {
                return "Argent insuffisant pour être répartit!";
            }
        }
    }
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
        total += (+userData["bankData"][key]);
        console.log(total);
    }
    // return bank graphic data
    return [bankDataGraphic, total];
}