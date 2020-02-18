
var drinkData,
    filterResults = {},
    filters = {
        searchText: "", 
        category: [], 
        ingredient: [], 
        glass: [], 
        alcoholicFilter: []
    },
    imagesLoading = 0;

$(window).on("load", () => {
    getNewData = false;
    
    if (getNewData) {
        getData();
    } else {
        $.get("drinks.json").then((data) => {
            console.log(data);
            drinkData = data;
            initRandom();
            initFilters();
            displayRandom();
            displayDrinkList();
        });   
    }
    
});

function initRandom() {
    $("#random").click(() => {
        displayRandom();
    });
}

function initFilters() {
    var container = $("#left .filters");
    
    // https://developer.snapappointments.com/bootstrap-select/methods/#selectpickermobile

    // Categories
    var categoriesContainer = $(container).find(".categories");
    drinkData.categories.forEach(category => {
        $(categoriesContainer).append(generateOption(category));
    });
    $(categoriesContainer).selectpicker("refresh").change((e) => {
        filterDrinks("category", $(categoriesContainer).selectpicker("val"));
    });

    // Ingredients
    var ingredientContainer = $(container).find(".ingredients");
    drinkData.ingredients.forEach(ingredient => {
        $(ingredientContainer).append(generateOption(ingredient));
    });
    $(ingredientContainer).selectpicker("refresh").change((e) => {
        filterDrinks("ingredient", $(ingredientContainer).selectpicker("val"));
    });

    // Glasses
    var glassesContainer = $(container).find(".glasses");
    drinkData.glasses.forEach(glass => {
        $(glassesContainer).append(generateOption(glass));
    });
    $(glassesContainer).selectpicker("refresh").change((e) => {
        filterDrinks("glass", $(glassesContainer).selectpicker("val"));
    });

    // Alcoholic Filters
    var alcoholicFiltersContainer = $(container).find(".alcoholicFilters");
    drinkData.alcoholicFilters.forEach(alcoholicFilter => {
        $(alcoholicFiltersContainer).append(generateOption(alcoholicFilter));
    });
    $(alcoholicFiltersContainer).selectpicker("refresh").change((e) => {
        filterDrinks("alcoholicFilter", $(alcoholicFiltersContainer).selectpicker("val"));
    });

    // Search
    $("#search").keyup((e) => {
		var searchVal = e.target.value.toLowerCase();
		filterDrinks("searchText", searchVal);
	});

    // Remove Filters
    $(container).find(".removeFilters").click((e) => {
        $(container).find("select").selectpicker("deselectAll");
        $("#search").val("");
        filterDrinks("searchText", "");
    });
}

function filterDrinks(prop, value) {
    drinkData.drinkIds.forEach(drinkId => {
        var drink = drinkData.drinks[drinkId];
        if (prop == "category") {
            if (value.length == 0) {
				removeProp(drinkId, "category");
			} else if (value.indexOf(drink.strCategory) > -1) {
				removeProp(drinkId, "category");
			} else {
				addProp(drinkId, "category");
			}
        } else if (prop == "ingredient") {
            if (value.length == 0) {
				removeProp(drinkId, "ingredient");
			} else {
                // Contain all ingredients
                // var matched = true;
                // value.forEach(ingredient => {
                //     if ($.inArray(ingredient, drink.ingredientList) == -1) {
                //         matched = false;
                //         removeProp(drinkId, "ingredient");
                //         addProp(drinkId, "ingredient");
                //     }
                // });
                // if (matched) {
				// 	removeProp(drinkId, "ingredient");
                // }


                // Contain any of the ingredients
                var matched = false;
                drink.ingredientList.forEach(ingredient => {
                    if (value.indexOf(ingredient) > -1) {
						matched = true;
						removeProp(drinkId, "ingredient");
					}
                });
                if (!matched) {
					addProp(drinkId, "ingredient");
                }
            } 
        } else if (prop == "glass") {
            if (value.length == 0) {
				removeProp(drinkId, "glass");
			} else if (value.indexOf(drink.strGlass) > -1) {
				removeProp(drinkId, "glass");
			} else {
				addProp(drinkId, "glass");
			}
        } else if (prop == "alcoholicFilter") {
            if (value.length == 0) {
				removeProp(drinkId, "alcoholicFilter");
			} else if (value.indexOf(drink.strAlcoholic) > -1) {
				removeProp(drinkId, "alcoholicFilter");
			} else {
				addProp(drinkId, "alcoholicFilter");
			}
        } else if (prop == "searchText") {
            if (value == "") {
				removeProp(drinkId, "searchText");
			} else if ((drink.strDrink.toLowerCase().indexOf(value) > -1)) {
				removeProp(drinkId, "searchText");
			} else {
				addProp(drinkId, "searchText");
			}
        }
    });

    // Add prop to hide 
    function addProp(id, prop) {
		var index = filterResults[id].indexOf(prop);
		if (!(index > -1)) {
			filterResults[id].push(prop);
		}
    }
    // Remove prop to hide 
	function removeProp(id, prop) {
		var index = filterResults[id].indexOf(prop);
		if (index > -1) {
			filterResults[id].splice(index, 1);
		}
    }

    // Hide/show drinks according to filter
	for (var id in filterResults) {
        // Drinks that don't match
		if (filterResults[id].length > 0) {
			$("#drink_" + id).hide();
		} else {
			$("#drink_" + id).show();
		}
    }
    updateTotalDrinks();
}


function generateOption(text) {
    var option = document.createElement("option");
    $(option).text(text);
    return option;
}

function displayRandom() {
    var id = drinkData.drinkIds[Math.floor(Math.random() * drinkData.drinkIds.length)];
    displayDrink(drinkData.drinks[id]);
}

function displayDrinkList() {
    console.log(drinkData.drinkIds);
    drinkData.drinkIds.forEach(drinkId => {
        var drink = drinkData.drinks[drinkId];
        filterResults[drinkId] = [];
        displayDrinkItem(drink);
    });
    updateTotalDrinks();
}

function displayDrinkItem(drink) {
    var container = $("#templates .drinkItem").clone();
    $(container).attr("id", "drink_"+drink.idDrink);

    // Handle keeping track of loading drink thumbnails
    imagesLoading++;
    $('<img/>').attr('src', drink.strDrinkThumb).on('load', function() {
        $(this).remove();
        $(container).find(".img").css("background-image", "url("+drink.strDrinkThumb+")");
        imagesLoading--;
        checkIfDoneLoading();
    });
    $(container).find(".title").text(drink.strDrink);
    
    $(container).click((e) => {
        displayDrink(drink);
    });
    $("#left .drinkList").append(container);
}

function checkIfDoneLoading() {
    var percent = Math.round(100 - ((imagesLoading/drinkData.drinkIds.length) * 100));
    if (imagesLoading == 0) {
        $("#loading").hide();
    }
    
    // Update progress bar
    $("#loading .progress-bar").text(percent+"%").attr("aria-valuenow", percent).css("width", percent+"%");
}

function displayDrink(drink) {
    var container = $("#templates .drink").clone();
    $(container).find(".title").text(drink.strDrink);
    $(container).find(".img").css("background-image", "url("+drink.strDrinkThumb+")");

    // Display ingredients
    var ingredientNum = 0,
        curIngredient = drink.strIngredient1,
        measure = drink.strMeasure1;
    while (curIngredient != null) {
        $(container).find(".ingredients > div").append(generateIngredientHtml(curIngredient, measure));
        $(container).find(".ingredients > div").append(document.createElement("hr"));
        // get next ingredient 
        ingredientNum++;
        curIngredient = drink["strIngredient"+(ingredientNum + 1)];
        measure = drink["strMeasure"+(ingredientNum + 1)];
    }
    $(container).find(".ingredients > div").children().last().remove();

    $(container).find(".instructions p").text(drink.strInstructions);
    if (drink.strAlcoholic == "Non alcoholic") {
        $(container).find(".alcoholic p").text("Does not contain alcohol");
    } else {
        $(container).find(".alcoholic p").text("Contains alcohol");
    }
    $(container).find(".category p").text(drink.strCategory);
    $(container).find(".glass p").text(drink.strGlass);

    $("#right").empty().append(container);

    $("#right").scrollTop(0);
}

function generateIngredientHtml(name, measure) {
    var container = $("#templates .ingredient").clone();
    $(container).find(".name").text(name);
    if (measure != null) {
        $(container).find(".middle").removeClass("hidden");
        $(container).find(".measure").text(measure);
    }
    var imgUrl = 'url("'+"https://www.thecocktaildb.com/images/ingredients/"+encodeURI(name)+".png"+'")';
    $(container).find(".img").css("background-image", imgUrl);
    return container;
}

function updateTotalDrinks() {
    $(".totalDrinks").text("Cocktails: "+$(".drinkItem:visible").length);
}
