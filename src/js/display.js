import {
    getBankData,

    getEarningsData,
    setEarningsData,

    getCategoriesData,
    categoriesList_add,
    categoriesList_remove,

} from "./logic.js"

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
    const ctx = document.getElementById("graphic");
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
        category_clone.querySelector(".b_categoryDelete").addEventListener("click", async (e) => {
            const categorieDetruite = await categoriesList_remove(category);
            if (categorieDetruite) {
                // On recharge la section
                loadBankCategories();
            }
        })

        //categoriesData.find((element) => element == newCategoryName)

        conteneur_categories.appendChild(category_clone);
    }
}

/*
--------------------------------// Actualisation de l'affichage des configurations
*/
async function loadConfigs() {

    var earningsData = await getEarningsData();
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
        for (const option of earningsData["Configs"][configName]) {
            const option_clone = template_option.content.cloneNode(true); // True pour récursif

            // Create an "option" for each possible category that can be selected
           const categorySelector = option_clone.querySelector(".o_category")
            for (const category of categoriesData) {
                const optionElement = document.createElement('option');
                optionElement.text = category;
                optionElement.value = category;
                categorySelector.options.add(optionElement);
            }

            categorySelector.value = option[0];

            option_clone.querySelector(".o_value").value = option[1];
            option_clone.querySelector(".o_type").value = option[2];

            conteneur_option.appendChild(option_clone);
        }

        // Ajouter le clone au conteneur
        conteneur_configs.appendChild(config_clone);
    }
}

/*
--------------------------------// Interactions
*/
document.getElementById("b_addCategory").addEventListener("click", async (e) => {
    // On va chercher la liste des categories actuelles
    var categoriesData = await getCategoriesData();
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