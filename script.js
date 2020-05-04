
var drinkData,
    filterResults = {},
    filterOption = "one",
    filters = {
        searchText: "", 
        category: [], 
        ingredient: [], 
        glass: [], 
        alcoholicFilter: []
    },
    imagesLoading = 0,
    drinksDisplayed = [];

$(window).on("load", () => {
    getNewData = false;
    
    if (getNewData) {
        getData();
    } else {
        $("#content, #header").addClass("blur");
        $.get("drinks.json").then((data) => {
            console.log(data);
            drinkData = data;
            initRandom();
            initFilters();
            displayDrinkList();
            initFiltersButton();
            displayRandom();
        });   
    }
    
});

function initRandom() {
    $("#random").click(() => {
        $("#content").addClass("show");
        displayRandom();
    });
}

function initFiltersButton() {
    $(".filters").on('transitionend webkitTransitionEnd oTransitionEnd', function (e) {
        // your event handler
        if ($(e.target).hasClass("show")) {
            $(e.target).addClass("done");
        }
    });

    $(".filtersIcon").click(() => {
        if($(".filters").hasClass("show")) {
            $(".filters").removeClass("show done");
        } else {
            $(".filters").addClass("show");
        }
    });
    $(".filters .close").click(() => {
        $(".filters").removeClass("show done");
    });
}

function initMobileSelectPickers() {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
        $.fn.selectpicker.Constructor.DEFAULTS.mobile = true;
    }
}

function initFilters() {
    var container = $("#left .filters");
    initMobileSelectPickers();
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

    // Ingredient options
    // var ingredientOptionsContainer = $(container).find(".ingredientsOptions");
    // $(ingredientOptionsContainer).find(".one").click(() => {
    //     if (filterOption != "one") {
    //         filterOption = "one";
    //         filterDrinks("ingredient", $(ingredientContainer).selectpicker("val"));
    //     }
    // });
    // $(ingredientOptionsContainer).find(".all").click(() => {
    //     if (filterOption != "all") {
    //         filterOption = "all";
    //         filterDrinks("ingredient", $(ingredientContainer).selectpicker("val"));
    //     }
    // });

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
                
                var ingredientsMatched = 0;
                drink.ingredientList.forEach(ingredient => {
                    if (value.includes(ingredient)) {
                        ingredientsMatched++;
                    }
                });

                if (ingredientsMatched >= value.length) {
                    removeProp(drinkId, "ingredient");
                } else if (ingredientsMatched >= drink.ingredientList.length) {
                    removeProp(drinkId, "ingredient");
                } else {
                    removeProp(drinkId, "ingredient");
                    addProp(drinkId, "ingredient");
                }
                



                // if (filterOption == "one") {
                //     // Contain any of the ingredients
                //     matched = false;
                //     drink.ingredientList.forEach(ingredient => {
                //         if (value.indexOf(ingredient) > -1) {
                //             matched = true;
                //             removeProp(drinkId, "ingredient");
                //         }
                //     });
                //     if (!matched) {
                //         addProp(drinkId, "ingredient");
                //     }
                // } else {
                //     // Contain all ingredients
                //     matched = true;
                //     value.forEach(ingredient => {
                //         if ($.inArray(ingredient, drink.ingredientList) == -1) {
                //             matched = false;
                //             removeProp(drinkId, "ingredient");
                //             addProp(drinkId, "ingredient");
                //         }
                //     });
                //     if (matched) {
                //     	removeProp(drinkId, "ingredient");
                //     }
                // }
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

    drinksDisplayed = drinkData.drinkIds.slice(0);
    // Hide/show drinks according to filter
	for (var id in filterResults) {
        // Drinks that don't match
		if (filterResults[id].length > 0) {
            $("#drink_" + id).hide();
            drinksDisplayed.splice(drinksDisplayed.indexOf(id), 1);
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
    // console.log(drinkData.drinkIds);
    drinkData.drinkIds.forEach(drinkId => {
        var drink = drinkData.drinks[drinkId];
        filterResults[drinkId] = [];
        displayDrinkItem(drink);
        drinksDisplayed.push(drinkId);
    });
    updateTotalDrinks();
    initColorDrinkListMobile();
}


function initColorDrinkListMobile() {
    $("#left .drinkList").scroll(e => {
        // check if mobile
        if ($(window).width() < 700) {
            var drinkListHeight = $("#left .drinkList").height();
            // console.log($("#left .drinkList").height());
            var heightOfDrinkItem = $("#left .drinkList > div").height();
            var maxNumberOfDrinks = Math.ceil(drinkListHeight/heightOfDrinkItem);
            var scrollTop = e.target.scrollTop;
            var currentListItem = Math.ceil(scrollTop / heightOfDrinkItem) + 1;
            $("#left .drinkList > div").removeClass("active");
            for (var i = 0; i < maxNumberOfDrinks; i++) {
                checkIfDrinkVisible(currentListItem + i, heightOfDrinkItem, scrollTop, (scrollTop + drinkListHeight));
            }
        }
    });

    // On start
    if ($(window).width() < 700) {
        var drinkListHeight = $("#left .drinkList").height();
        var heightOfDrinkItem = $("#left .drinkList > div").height();
        var maxNumberOfDrinks = Math.floor(drinkListHeight/heightOfDrinkItem);
        var scrollTop = $("#left .drinkList")[0].scrollTop;
        var currentListItem = Math.ceil(scrollTop / heightOfDrinkItem) + 1;
        for (var i = 0; i < maxNumberOfDrinks; i++) {
            checkIfDrinkVisible(currentListItem + i, heightOfDrinkItem, scrollTop, (scrollTop + drinkListHeight));
        }
    }

    function checkIfDrinkVisible(index, heightOfDrink, scrollTop, scrollBottom) {
        var topOfItem = (index * heightOfDrink) - heightOfDrink;
        var bottomOfItem = (index * heightOfDrink);
        // console.log("Check item");
        // console.log("Top of item: " + topOfItem);
        // console.log("Scroll top: " + scrollTop);
        // console.log("Bottom of item: " + bottomOfItem);
        // console.log("Scroll bottom: " + scrollBottom);
        if (topOfItem >= scrollTop && bottomOfItem <= scrollBottom) {
            // console.log(index);
            // console.log(drinkData.drinks[drinksDisplayed[index-1]]);
            $("#drink_"+drinksDisplayed[index-1]).addClass("active");
        }
    }
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
        $("#content").addClass("show");
        $("#left .drinkList .active").removeClass("active");
        $(container).addClass("active");
        displayDrink(drink);
    });
    $("#left .drinkList").append(container);
}

function checkIfDoneLoading() {
    var percent = Math.round(100 - ((imagesLoading/drinkData.drinkIds.length) * 100));
    if (imagesLoading == 0) {
        $("#loading").hide();
        $("#content, #header").removeClass("blur");
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
        $(container).find(".alcoholic i").text("cancel");
        $(container).find(".alcoholic p").text("Does not contain alcohol");
    } else {
        $(container).find(".alcoholic p").text("Contains alcohol");
    }
    $(container).find(".category p").text(drink.strCategory);
    $(container).find(".glass p").text(drink.strGlass);
    
    $(container).find(".goBack").click(() => {
        $("#left .drinkList .active").removeClass("active");
        $("#content").removeClass("show");
    });

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