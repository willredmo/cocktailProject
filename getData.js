var mainData = {
        drinks: {},
        drinkIds: [],
        ingredients: [],
        categories: [],
        glasses: [],
        alcoholicFilters: []
    };

function getData() {
    getCategories().done((data) => {
        getDrinksByCategory(data.drinks, 0);
    });
}

function getCategories() {
    return $.get("https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list");
}

function getDrinksByCategory(categories, index) {
    if (index == categories.length) {
        getDrinkInfo(0); // Go get rest of data
        return;
    }
    $.get("https://www.thecocktaildb.com/api/json/v1/1/filter.php", {c: categories[index].strCategory}).done((data) => {
        data.drinks.forEach(drink => {
            addDrink(drink);
        });
        index++;
        getDrinksByCategory(categories, index);
    }); 
}

function addDrink(drink) {
    var drinksToExclude = ["15395", "16405", "14360", "15182", "15743", "13198", "17122"];
    if (!mainData.drinks[drink.idDrink] && !drinksToExclude.includes(drink.idDrink)) {
        console.log(drink);
        mainData.drinks[drink.idDrink] = drink;
        mainData.drinkIds.push(drink.idDrink);
    }
}

function getDrinkInfo(index) {
    if (index == mainData.drinkIds.length) { //drinkIds.length
        console.log("Done");
        saveData();
        return;
    }
    var drinkId = mainData.drinkIds[index];
    $.get("https://www.thecocktaildb.com/api/json/v1/1/lookup.php", {i: drinkId}).then((data) => {
        console.log(index);
        addDrinkInfo(data.drinks[0]);
        index++;
        getDrinkInfo(index);
    });
}

function addDrinkInfo(drink) {
    drink.strGlass = formatString(drink.strGlass);
    mainData.drinks[drink.idDrink] = drink;
    mainData.drinks[drink.idDrink].ingredientList = addIngredients(drink);
    addCategory(drink.strCategory);
    addGlass(drink.strGlass);
    if (drink.strAlcoholic == null) {
        mainData.drinks[drink.idDrink].strAlcoholic = "Alcoholic";
    }
    addAlcoholicFilter(drink.strAlcoholic);
}

function addIngredients(drink) {
    var ingredientNum = 1;
    var curIngredient = drink.strIngredient1;
    var ingredientList = [];
    while (curIngredient != null && curIngredient != "") {
        curIngredient = formatString(curIngredient);
        mainData.drinks[drink.idDrink]["strIngredient"+(ingredientNum)] = curIngredient;
        ingredientList.push(curIngredient);
        
        if (!mainData.ingredients.includes(curIngredient)) {
            mainData.ingredients.push(curIngredient);
        }
        ingredientNum++;
        curIngredient = drink["strIngredient"+(ingredientNum)];
    }
    return ingredientList;
}

function formatString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function addCategory(category) {
    if (!mainData.categories.includes(category)) {
        mainData.categories.push(category);
    }
}

function addGlass(glass) {
    if (!mainData.glasses.includes(glass)) {
        mainData.glasses.push(glass);
    }
}

function addAlcoholicFilter(alcoholic) {
    if (!mainData.alcoholicFilters.includes(alcoholic)) {
        mainData.alcoholicFilters.push(alcoholic);
    }
}

function saveData() {
    // sort arrays
    mainData.ingredients = mainData.ingredients.sort();
    mainData.categories = mainData.categories.sort();
    mainData.glasses = mainData.glasses.sort();
    mainData.alcoholicFilters = mainData.alcoholicFilters.sort();

    mainData.totalDrinks = mainData.drinkIds.length;
    orderDrinkIds();
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(JSON.stringify(mainData, null, 1)));
    a.setAttribute('download', "drinks.json");
    a.click();   
}

function orderDrinkIds() {
    mainData.drinkIds.sort(function(a, b) {
        var textA = mainData.drinks[a].strDrink.toUpperCase();
        var textB = mainData.drinks[b].strDrink.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
}
