import { saveFile, loadFile } from "./storage.js";

var userData = null; // User data will be loaded here

// Blank data that is used 
var blank_userData = {
    "bankData": {
        "Autres": 0,
        "Logement": 0,
        "Nourriture": 0,
        "Divertissement": 0,
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
        if (gotData != null && gotData != "" && Object.keys(gotData).length > 0) {
            userData = JSON.parse(gotData);
            //userData = gotData; // The backend already converts the JSON string to an object before returning it
        }
    }
    console.log("User data loaded:", userData);
    // If user data is still empty we load blank one
    if (userData == null || userData == "") {
        userData = blank_userData;
    }
    console.log("User data loaded after:", userData);
}
//---------------------------------------------------------- SAVE User Data
if (window.electronAPI) {
    window.electronAPI.onApplicationClosing(async () => {
        // Save file
        /*await saveFile(JSON.stringify(userData));*/
        await saveFile(userData); // Le backend convertit déjà l'objet en JSON avant de le sauvegarder
        // Dire à Electron que la sauvegarde est terminée
        window.electronAPI.saveComplete();
    });
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
        userData["bankData"][categoryName] = 0;
        // Save file
        await saveFile(JSON.stringify(userData));
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
        if (userData["bankData"][categoryName] != null) {
            userData["bankData"]["Autres"] = userData["bankData"]["Autres"] + (+userData["bankData"][categoryName]);
            delete userData["bankData"][categoryName];
        }
        // Save file
        await saveFile(JSON.stringify(userData));
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
            // Save file
            await saveFile(JSON.stringify(userData));
            // Retour du résultat
            return true;
        }
    }
    return false;
}
export async function config_option_modify(configName, optionIndex, newValue) {
    if (userData["EarningsData"]["Configs"][configName] != null) {
        userData["EarningsData"]["Configs"][configName][optionIndex] = newValue;
        // Save file
        await saveFile(JSON.stringify(userData));
    }
}
export async function config_add(configName) {
    if (userData["EarningsData"]["Configs"][configName] == null) {
        userData["EarningsData"]["Configs"][configName] = {
            "op0": ["Autres", 100, "%"],
        }
        // Save file
        await saveFile(JSON.stringify(userData));

        return true;
    }
    return false;
}
export async function config_remove(configName) {
    if (userData["EarningsData"]["Configs"][configName] != null) {
        delete userData["EarningsData"]["Configs"][configName];
        // Save file
        await saveFile(JSON.stringify(userData));

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

            // Save file
            await saveFile(JSON.stringify(userData));

            return true;
        } else {
            if (sommePercentage != 100) {
                return "La somme est différente de 100%!";
            } else {
                return "Argent insuffisant!";
            }
        }
    }
}

export async function addMoney_to(categoryName, amount) {
    if (userData["bankData"][categoryName] != null) {
        userData["bankData"][categoryName] += (+amount);
    }
    // Save file
    await saveFile(JSON.stringify(userData));
}
export async function removeMoney_from(categoryName, amount) {
    if (userData["bankData"][categoryName] != null) {
        userData["bankData"][categoryName] -= (+amount);
    }
    // Save file
    await saveFile(JSON.stringify(userData));
}
export async function getReal_BankData() {
    return userData["bankData"];
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