
// ===== Commun =====

// --- Montants ---
// Stockés en centimes entiers pour éviter les erreurs d'arrondi des nombres à virgule

function formaterMontant(centimes) {
    return (centimes / 100).toFixed(2).replace(".", ",");
}

const conversionCentimes = (montant) => {
    return Math.round(Number(montant) * 100);
};

// --- Ligne de liste (charges et opérations) ---

const creerLigneSupprimable = (nomValeur, dateValeur, montantValeur, liste, messageVide, supprimerLigne, type, modifierLigne) => {
    const nouvelleLigne = document.createElement("li");
    nouvelleLigne.classList.add("ligne-operation");

    const spanNom = document.createElement("span");
    spanNom.textContent = nomValeur;
    nouvelleLigne.appendChild(spanNom);

    const spanDate = document.createElement("span");
    spanDate.textContent = dateValeur;
    nouvelleLigne.appendChild(spanDate);

    const spanMontant = document.createElement("span");
    if (type === "revenu") {
        spanMontant.classList.add("operation-revenu");
        spanMontant.textContent = `+ ${formaterMontant(montantValeur)} €`;
    } else if (type === "depense") {
        spanMontant.classList.add("operation-depense");
        spanMontant.textContent = `- ${formaterMontant(montantValeur)} €`;
    } else {
        spanMontant.textContent = `${formaterMontant(montantValeur)} €`;
    }
    nouvelleLigne.appendChild(spanMontant);

    const boutonModifier = document.createElement("button");
    boutonModifier.textContent = "✏️";
    nouvelleLigne.appendChild(boutonModifier);

    boutonModifier.addEventListener("click", function () {
        modifierLigne();
    });

    const boutonSupprimer = document.createElement("button");
    boutonSupprimer.textContent = "🗑️";
    nouvelleLigne.appendChild(boutonSupprimer);

    boutonSupprimer.addEventListener("click", function () {
        nouvelleLigne.remove();
        supprimerLigne();
        if (liste.children.length === 0) {
            messageVide.style.display = "block";
        }
        calculerSoldeDisponible();
    });
    liste.appendChild(nouvelleLigne);
    messageVide.style.display = "none";
    calculerSoldeDisponible();
};

// --- Solde et tableau de bord ---

const soldeDisponible = document.getElementById("solde-actuel");
const revenuDisponible = document.getElementById("total-revenus");
const totalDepenses = document.getElementById("total-depenses");
const remplissage = document.getElementById("remplissage");
const pourcentageBudgetAffiche = document.getElementById("pourcentage-budget");
let solde = 0;

const calculerSoldeDisponible = () => {
    totalDepenses.textContent = `${formaterMontant(totalChargesFixes + totalOperationsDepenses)} €`;
    revenuDisponible.textContent = `${formaterMontant(salaire + totalOperationsRevenus)} €`;
    solde = (salaire + totalOperationsRevenus) - (totalChargesFixes + totalOperationsDepenses);
    soldeDisponible.textContent = solde < 0 ? `- ${formaterMontant(solde * -1)} €` : `${formaterMontant(solde)} €`;
    if (solde > 0) {
        soldeDisponible.style.color = "green";
    } else if (solde < 0) {
        soldeDisponible.style.color = "red";
    } else {
        soldeDisponible.style.color = "white";
    }

    // Part du salaire entamée : 0 % tant que le solde dépasse le salaire
    const pourcentageBudget = salaire > 0 ? Math.max(0, Math.min(100, (salaire - solde) / salaire * 100)) : 0;
    remplissage.style.width = `${pourcentageBudget}%`;
    pourcentageBudgetAffiche.textContent = `${Math.round(pourcentageBudget)} %`;

    localStorage.setItem("salaire", JSON.stringify(salaire));
    localStorage.setItem("chargesFixes", JSON.stringify(tableauChargesFixes));
    localStorage.setItem("operations", JSON.stringify(tableauOperations));
};

// --- Hauteur des listes ---

const moduleListeCharges = document.getElementById("module-liste-charges");
const moduleDernieresOperations = document.getElementById("module-dernieres-operations");

// Marges en rem, variables selon l'écran : on lit les valeurs réelles
const margesSousLaCarte = (carte) => {
    return parseFloat(getComputedStyle(carte).marginBottom) + parseFloat(getComputedStyle(document.querySelector("main")).marginBottom);
};

const ajusterHauteurListe = (liste, carte) => {
    const rectangle = liste.getBoundingClientRect();
    const styleCarte = getComputedStyle(carte);
    const espaceSousLaListe = parseFloat(styleCarte.paddingBottom) + parseFloat(styleCarte.borderBottomWidth) + margesSousLaCarte(carte);
    const espaceDisponible = window.innerHeight - rectangle.top - espaceSousLaListe;
    liste.style.maxHeight = Math.max(40, espaceDisponible) + "px";
};

const ajusterHauteurCarte = (carte) => {
    const rectangle = carte.getBoundingClientRect();
    const espaceDisponible = window.innerHeight - rectangle.top - margesSousLaCarte(carte);
    carte.style.maxHeight = Math.max(80, espaceDisponible) + "px";
};

const ajusterHauteurs = () => {
    ajusterHauteurListe(chargesFixes, moduleListeCharges);
    ajusterHauteurListe(operations, moduleDernieresOperations);
    ajusterHauteurCarte(moduleListeCharges);
    ajusterHauteurCarte(moduleDernieresOperations);
};

window.addEventListener("resize", ajusterHauteurs);

// ===== Salaire =====

const formulaireSalaire = document.getElementById("formulaire-salaire");
const salaireMensuel = document.getElementById("salaire-mensuel");
const salaireAffiche = document.getElementById("salaire-affiche");
let salaire = 0;

formulaireSalaire.addEventListener("submit", function (event) {
    event.preventDefault();

    salaire = conversionCentimes(salaireMensuel.value);
    salaireAffiche.textContent = `${formaterMontant(salaire)} €`;
    salaireMensuel.value = "";

    calculerSoldeDisponible();
});

// ===== Charges fixes =====

const formulaireCharge = document.getElementById("formulaire-charge");
const nomCharge = document.getElementById("nom-charge");
const montantCharge = document.getElementById("montant-charge");
const dateCharge = document.getElementById("date-charge");
const messageChargesVide = document.getElementById("message-charges-vide");
const chargesFixes = document.getElementById("charges-fixes");
const chargesfixesAffiche = document.getElementById("charges-fixes-total");
let totalChargesFixes = 0;
let idChargeModifier = null; // null = ajout, sinon id de la charge en cours de modification
let tableauChargesFixes = [];

const afficherChargesFixes = () => {
    chargesFixes.innerHTML = "";
    totalChargesFixes = tableauChargesFixes.reduce((accumulateur, charge) => accumulateur + charge.montant, 0);
    chargesfixesAffiche.textContent = `${formaterMontant(totalChargesFixes)} €`;
    tableauChargesFixes.forEach(charge => {
        creerLigneSupprimable(charge.nom, charge.date, charge.montant, chargesFixes, messageChargesVide, function () {
            tableauChargesFixes = tableauChargesFixes.filter(c => c.id !== charge.id);
            afficherChargesFixes();
        }, null, function () {
            idChargeModifier = charge.id;
            const chargeAmodifier = tableauChargesFixes.find(c => c.id === idChargeModifier);
            nomCharge.value = chargeAmodifier.nom;
            montantCharge.value = chargeAmodifier.montant / 100;
            dateCharge.value = chargeAmodifier.date;
        });
    });
    ajusterHauteurs();
};

formulaireCharge.addEventListener("submit", function (event) {
    event.preventDefault();
    const nomChargeValeur = nomCharge.value;
    const montantChargeValeur = conversionCentimes(montantCharge.value);
    const dateChargeValeur = dateCharge.value;
    if (idChargeModifier === null) {
        const nouvelleCharge = {
            id: Date.now(),
            nom: nomChargeValeur,
            montant: montantChargeValeur,
            date: dateChargeValeur
        };
        tableauChargesFixes.push(nouvelleCharge);
    } else {
        const chargeAmodifier = tableauChargesFixes.find(
            charge => charge.id === idChargeModifier
        );
        chargeAmodifier.nom = nomChargeValeur;
        chargeAmodifier.montant = montantChargeValeur;
        chargeAmodifier.date = dateChargeValeur;
    };

    idChargeModifier = null;
    formulaireCharge.reset();
    afficherChargesFixes();
});

// ===== Opérations =====

const iconsCategorie = {
    "alimentation": "🍎",
    "transport": "🚗",
    "loisirs": "🎨",
    "autre": "❓"
};

const formulaireOperation = document.getElementById("formulaire-operation");
const nomOperation = document.getElementById("nom-operation");
const montantOperation = document.getElementById("montant-operation");
const typeOperation = document.getElementById("type-operation");
const categorieOperation = document.getElementById("categorie-operation");
const dateOperation = document.getElementById("date-operation");
const messageVide = document.getElementById("message-vide");
const operations = document.getElementById("operations");
const depensesMensuellesAffiche = document.getElementById("depenses-mensuelles");
let totalOperationsDepenses = 0;
let totalOperationsRevenus = 0;
let tableauOperations = [];
let idOperationModifier = null;

const afficherOperations = () => {
    operations.innerHTML = "";
    totalOperationsRevenus = tableauOperations.reduce((accumulateur, operation) => {
        return operation.type === "revenu" ? accumulateur + operation.montant : accumulateur;
    }, 0);
    totalOperationsDepenses = tableauOperations.reduce((accumulateur, operation) => {
        return operation.type === "depense" ? accumulateur + operation.montant : accumulateur;
    }, 0);
    depensesMensuellesAffiche.textContent = `${formaterMontant(totalOperationsDepenses)} €`;
    tableauOperations.forEach(operation => {
        creerLigneSupprimable(`${iconsCategorie[operation.categorie]} ${operation.nom}`, operation.date, operation.montant, operations, messageVide, function () {
            tableauOperations = tableauOperations.filter(op => op.id !== operation.id);
            afficherOperations();
        }, operation.type, function () {
            idOperationModifier = operation.id;
            const operationAmodifier = tableauOperations.find(c => c.id === idOperationModifier);
            nomOperation.value = operationAmodifier.nom;
            montantOperation.value = operationAmodifier.montant / 100;
            typeOperation.value = operationAmodifier.type;
            categorieOperation.value = operationAmodifier.categorie;
            dateOperation.value = operationAmodifier.date;
        });
    });
    ajusterHauteurs();
};

formulaireOperation.addEventListener("submit", function (event) {
    event.preventDefault();
    const nomOperationValeur = nomOperation.value;
    const montantOperationValeur = conversionCentimes(montantOperation.value);
    const typeOperationValeur = typeOperation.value;
    const categorieOperationValeur = categorieOperation.value;
    const dateOperationValeur = dateOperation.value;
    if (idOperationModifier === null) {
        const nouvelleOperation = {
            id: Date.now(),
            nom: nomOperationValeur,
            montant: montantOperationValeur,
            type: typeOperationValeur,
            categorie: categorieOperationValeur,
            date: dateOperationValeur,
        };
        tableauOperations.push(nouvelleOperation);
    } else {
        const operationAmodifier = tableauOperations.find(operation => operation.id === idOperationModifier);
        operationAmodifier.nom = nomOperationValeur;
        operationAmodifier.montant = montantOperationValeur;
        operationAmodifier.type = typeOperationValeur;
        operationAmodifier.categorie = categorieOperationValeur;
        operationAmodifier.date = dateOperationValeur;
    };
    idOperationModifier = null;
    formulaireOperation.reset();
    afficherOperations();
});

// ===== Initialisation =====
// En dernier : le premier affichage utilise les variables de toutes les sections

tableauChargesFixes = JSON.parse(localStorage.getItem("chargesFixes")) || [];
tableauOperations = JSON.parse(localStorage.getItem("operations")) || [];
salaire = JSON.parse(localStorage.getItem("salaire")) || 0;

salaireAffiche.textContent = `${formaterMontant(salaire)} €`;
afficherChargesFixes();
afficherOperations();
calculerSoldeDisponible();
