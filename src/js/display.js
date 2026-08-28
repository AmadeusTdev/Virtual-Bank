import {
    // Bank stats
    getBankData,
    getCategoriesData,
    categoriesList_add,
    categoriesList_remove,

    // Earnings
    getEarningsData,
    config_option_remove,
    config_option_modify,
    config_add,
    config_remove,
    config_use,

    // Spendings
    getReal_BankData,
    addMoney_to,
    removeMoney_from,

} from "./logic.js"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/*
--------------------------------// Navigation entre les sections
*/
var button_tuto = document.getElementById("b_tuto")
var button_bank = document.getElementById("b_bank")
var button_earning = document.getElementById("b_earning")
var button_spending = document.getElementById("b_spending")
var button_activity = document.getElementById("b_activity")

function afficherSection(id) {
    document.querySelectorAll("section").forEach(section => {
        section.style.display = "none";
    });

    document.getElementById(id).style.display = "block";
}

button_tuto.addEventListener("click", function() {
    afficherSection("s_tuto");
});
button_bank.addEventListener("click", function() {
    afficherSection("s_bank");
    drawBank();
    loadBankCategories();
});
button_earning.addEventListener("click", function() {
    afficherSection("s_earning");
    loadConfigs();
});
button_spending.addEventListener("click", function() {
    afficherSection("s_spending");
    loadSpendings();
});
button_activity.addEventListener("click", function() {
    afficherSection("s_activity");
});
// Section par défaut
afficherSection("s_tuto");

/*
--------------------------------// Actualisation de l'affichage de la banque
*/
async function drawBank() {

    // On enlève le graphique précédent
    const graphicContainer = document.getElementById("graphic-container");
    graphicContainer.innerHTML = "";

    // On créer un nouveau graphique
    const ctx = document.createElement("canvas");
    ctx.id = "graphic";
    graphicContainer.appendChild(ctx);

    // Get bank data
    const [bankData, total] = await getBankData();
    // Graph
    new Chart(ctx, {
        type: "pie",

        data: {
            labels: bankData["labels"],
            datasets: [{
                data: bankData["values"]
            }]
        },

        options: {
            responsive: false,
            plugins: {
                legend: {
                    position: "top"
                }
            },
        }
    });
    // Display total
    document.getElementById("total").innerText = "Total: " + total + " €";
}
async function loadBankCategories() {
    const categoriesData = await getCategoriesData();

    // On vide le conteneur
    const conteneur_categories = document.getElementById("conteneur_categories");
    conteneur_categories.querySelectorAll(":scope > :not(template)").forEach(element => element.remove());

    // Remplir le conteneur avec chaque categorie
    const template_category = document.getElementById("template_category");
    for (const category of categoriesData) {
        const category_clone = template_category.content.cloneNode(true); // True pour récursif

        category_clone.querySelector(".b_categoryName").innerText = category;
        // Enlever la catégorie
        if (category == "Autres") {
            category_clone.querySelector(".b_categoryDelete").remove();
            category_clone.querySelector(".b_categoryName").style.width = "100%";
        } else {
            category_clone.querySelector(".b_categoryDelete").addEventListener("click", async (e) => {
                const categorieDetruite = await categoriesList_remove(category);
                if (categorieDetruite) {
                    // On recharge la section
                    drawBank();
                    loadBankCategories();
                }
            })
        }

        conteneur_categories.appendChild(category_clone);
    }
}

/*
--------------------------------// Actualisation de l'affichage des configurations
*/
async function loadConfigs() {

    const earningsData = await getEarningsData();
    const categoriesData = await getCategoriesData();

    // On vide le conteneur avant de le remplir (on n'enlève pas la template)
    const conteneur_configs = document.getElementById("conteneur_configs");
    conteneur_configs.querySelectorAll(":scope > :not(template)").forEach(element => element.remove());

    // Remplir le conteneur avec chaque configurations
    const template_config = document.getElementById("template_config");
    for (const configName of Object.keys(earningsData["Configs"])) {
        const config_clone = template_config.content.cloneNode(true); // True pour récursif

        config_clone.querySelector(".t_name").textContent = configName;
        // Remplire la configuration avec chaque option
        const conteneur_option = config_clone.querySelector("#conteneur_options");
        const template_option = config_clone.querySelector("#template_option");
        for (const optionIndex of Object.keys(earningsData["Configs"][configName])) {
            const option = earningsData["Configs"][configName][optionIndex];
            const option_clone = template_option.content.cloneNode(true); // True pour récursif

            // Create an "option" for each possible category that can be selected
            const option_select_category = option_clone.querySelector(".o_category");
            const option_select_value = option_clone.querySelector(".o_value");
            const option_select_type = option_clone.querySelector(".o_type");

            for (const category of categoriesData) {
                const optionElement = document.createElement('option');
                optionElement.text = category;
                optionElement.value = category;
                option_select_category.options.add(optionElement);
            }
            
            // On remplis avec les données de base
            option_select_category.value = option[0];
            option_select_value.value = option[1];
            option_select_type.value = option[2];

            // Boutton pour détruire l'option
            option_clone.querySelector(".o_delete").addEventListener("click", async (e) => {
                // Delete option
                const deletedOption = await config_option_remove(configName, optionIndex);
                if (deletedOption) {
                    // On recharge la section
                    loadConfigs();
                }
            })
            // Modifier l'option
            option_select_category.addEventListener("change", async (e) => {
                // Changement de catégorie
                const newValue = option_select_category.value;
                option[0] = newValue;
                // Mise à jour des données
                await config_option_modify(configName, optionIndex, option);
            })
            option_select_value.addEventListener("change", async (e) => {
                // Changement de valeur
                const newValue = option_select_value.value;
                option[1] = newValue;
                // Mise à jour des données
                await config_option_modify(configName, optionIndex, option);
            })
            option_select_type.addEventListener("change", async (e) => {
                // Changement de type
                const newValue = option_select_type.value;
                option[2] = newValue;
                // Mise à jour des données
                await config_option_modify(configName, optionIndex, option);
            })

            // Ajouter le clone au conteneur
            conteneur_option.appendChild(option_clone);
        }

        config_clone.querySelector("#t_addCategory").addEventListener("click", async (e) => {
            // Add new option
            // On reprend des nouvelles données pour être à jour
            const new_earningsData = await getEarningsData();
            var unusedIndex = 0;
            while (new_earningsData["Configs"][configName]["op"+unusedIndex] != null) {
                unusedIndex++;
            }
            // On a trouvé un index libre pour une nouvelle option dans la configuration
            await config_option_modify(configName, "op"+unusedIndex, ["Autres", 0, "%"]);
            // On recharge la section
            loadConfigs();
        })
        config_clone.querySelector(".t_delete").addEventListener("click", async (e) => {
            // Destroy template
            await config_remove(configName);
            // On recharge la section
            loadConfigs();
        })

        var cooldown = false;
        const inputAmount = config_clone.querySelector(".t_moneyInput");
        const addToBankButton = config_clone.querySelector("#t_add");
        addToBankButton.addEventListener("click", async (e) => {
            if (!cooldown) {
                cooldown = true;

                // Use configuration
                const valueAdding = inputAmount.value;
                const success = await config_use(configName, valueAdding);
                if (success == true) {
                    addToBankButton.textContent = "Succès de l'ajout!";
                    inputAmount.value = 0;
                } else {
                    addToBankButton.textContent = success;
                }
                await delay(1000); // 1 seconde
                addToBankButton.textContent = "Ajouter à la Banque";

                cooldown = false;
            }
        })
        // Ajouter le clone au conteneur
        conteneur_configs.appendChild(config_clone);
    }
}

/*
--------------------------------// Actualisation de l'affichage des options pour dépenser ou transférer de l'argent
*/
async function loadSpendings() {
    const select_use_from = document.getElementById("select_use_from");
    const select_transfer_from = document.getElementById("select_transfer_from");
    const select_transfer_to = document.getElementById("select_transfer_to");

    // On vide les options précédentes
    function removeOptions(selectElement) {
        var i, L = selectElement.options.length - 1;
        for(i = L; i >= 0; i--) {
            selectElement.remove(i);
        }
    }
    removeOptions(select_use_from);
    removeOptions(select_transfer_from);
    removeOptions(select_transfer_to);

    // On va chercher la liste des categories actuelles
    const categoriesData = await getCategoriesData();

    for (const category of categoriesData) {
        const optionElement = document.createElement('option');
        optionElement.text = category;
        optionElement.value = category;

        select_use_from.options.add(optionElement);
        select_transfer_from.options.add(optionElement.cloneNode(true));
        select_transfer_to.options.add(optionElement.cloneNode(true));
    }
}

/*
--------------------------------// Interactions
*/
document.getElementById("b_addCategory").addEventListener("click", async (e) => {
    // On va chercher la liste des categories actuelles
    const categoriesData = await getCategoriesData();
    // On va chercher le nom de la categorie que l'utilisateur souhaite créer
    const newCategoryName = document.getElementById("b_InputCategoryName").value;
    // On ajoute la catégorie si elle ne s'y trouve pas
    if (!categoriesData.find((element) => element == newCategoryName)) {
        const categorieAjoutee = await categoriesList_add(newCategoryName);
        if (categorieAjoutee) {
            // On recharge la section
            loadBankCategories();
        }
    }
})
document.getElementById("t_addConfig").addEventListener("click", async (e) => {
    const newConfigName = document.getElementById("t_InputConfigName").value;
    const configAjoutee = await config_add(newConfigName);
    if (configAjoutee) {
        // On recharge la section
        loadConfigs();
    }
})

var canSpend = true;
const spend_button = document.getElementById("s_spend"); 
spend_button.addEventListener("click", async (e) => {
    if (canSpend) {
        canSpend = false;

        const selected_category_from = document.getElementById("select_use_from").value;
        const amount_spending = document.getElementById("spending_amnt").value;

        const user_bankData = await getReal_BankData();
        if (user_bankData[selected_category_from] != null) {
            if (user_bankData[selected_category_from] >= (+amount_spending)) {
                // Use money from
                removeMoney_from(selected_category_from, amount_spending);
                spend_button.textContent = "Succès!";
            } else {
                spend_button.textContent = "Montant insuffisant!";
            }
        } else {
            spend_button.textContent = "Catégorie invalide!";
        }

        await delay(1000); // 1 seconde
        spend_button.textContent = "Dépenser";

        canSpend = true;
    }
})
var canTransfer = true;
const transfer_button = document.getElementById("s_transfer");
transfer_button.addEventListener("click", async (e) => {
    if (canTransfer) {
        canTransfer = false;

        const selected_category_from = document.getElementById("select_transfer_from").value;
        const selected_category_to = document.getElementById("select_transfer_to").value;
        const amount_transferring = document.getElementById("transferring_amnt").value;

        const user_bankData = await getReal_BankData();

        if (user_bankData[selected_category_from] != null && user_bankData[selected_category_to] != null) {
            if (user_bankData[selected_category_from] >= (+amount_transferring)) {
                // Transfer money
                removeMoney_from(selected_category_from, amount_transferring);
                addMoney_to(selected_category_to, amount_transferring);
                transfer_button.textContent = "Succès!";
            } else {
                transfer_button.textContent = "Montant insuffisant!";
            }
        } else {
            transfer_button.textContent = "Catégories invalides!";
        }

        await delay(1000); // 1 seconde
        transfer_button.textContent = "Transférer";

        canTransfer = true;
    }
})
