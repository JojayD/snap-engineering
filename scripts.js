const csvURL = "lenses.csv";

let favoritedCards = [];
let originalData = [];
let data = [];
let isFavoritedAllowed = false; // State is at My lenses

function shallowEqual(obj1, obj2) {
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (let key of keys1) {
		if (obj1[key] !== obj2[key]) {
			return false;
		}
	}

	return true;
}

async function loadData() {
	data = await fetchAndParseCSV(csvURL);
	originalData = [...data];
	showCards();
}
function clearCards() {
	const containerForCards = document.getElementById("container__cards");
	containerForCards.innerHTML = "";
}

function deleteCard(cardId) {
	let storedFavorites = JSON.parse(
		localStorage.getItem("favoritedCards") || "[]"
	);

	storedFavorites = storedFavorites.filter((item) => item.cardId != cardId);

	localStorage.setItem("favoritedCards", JSON.stringify(storedFavorites));

	favoritedCards = storedFavorites;

	if (isFavoritedAllowed) {
		showFavorites();
	}
}

function sortDataAndRender(sortProperty) {
	clearCards();

	if (sortProperty == "useCounts") {
		data.sort((a, b) => {
			if (a[sortProperty] < b[sortProperty]) return 1;
			if (a[sortProperty] > b[sortProperty]) return -1;
			return 0;
		});
	} else {
		data.sort((a, b) => {
			if (a[sortProperty] < b[sortProperty]) return -1;
			if (a[sortProperty] > b[sortProperty]) return 1;
			return 0;
		});
	}

	showCards();
}

function showAllCards() {
	clearCards();
	data = [...originalData];
	showCards();
}

async function showCards() {
	try {
		data.forEach((item, index) => {
			const containerForCards = document.getElementById("container__cards");
			const cardContentWrapper = document.createElement("div");
			cardContentWrapper.className = "card__content-wrapper ";
			const card = document.createElement("div");
			card.className = "card-container";

			/**
			 * creating element for name of filter
			 */
			const filterNameContainer = document.createElement("h3");
			const filterName = item.Name;
			filterNameContainer.innerHTML = filterName;
			filterNameContainer.className = "container__filter-name";
			/**
			 * creating image card
			 */

			const img = document.createElement("img");
			img.src = item.URL ? item.URL : "https://picsum.photos/id/237/200/300";
			img.alt = "Image";

			/**3
			 * creator name
			 */
			const creatorNameText = document.createElement("h3");
			const creatorName = item["Creator Name"];
			creatorNameText.innerHTML = `Creator Name: ${creatorName}`;

			const useCounts = item.useCounts;

			/**
					                Sets the attribute
					            */
			card.setAttribute("data-card-id", index);
			card.setAttribute("name", filterName);
			card.setAttribute("url", item.URL);
			card.setAttribute("creator-name", creatorName);
			card.setAttribute("useCounts", useCounts);
			/**
			 * Appending to create card
			 */
			cardContentWrapper.appendChild(filterNameContainer);
			cardContentWrapper.appendChild(img);
			cardContentWrapper.appendChild(creatorNameText);
			card.appendChild(cardContentWrapper);
			containerForCards.appendChild(card);
		});
	} catch (err) {
		console.log(err);
	}
}

async function fetchAndParseCSV(url) {
	const response = await fetch(url);
	const csvData = await response.text();
	return Papa.parse(csvData, { header: true, dynamicTyping: true }).data;
}

function showFavorites() {
	clearCards();

	// Retrieve favorited cards from localStorage, with a fallback to an empty array
	const storedFavoritesString = localStorage.getItem("favoritedCards");

	// Attempt to parse the stored string, ensuring we handle parsing errors or null values
	try {
		if (storedFavoritesString) {
			favoritedCards = JSON.parse(storedFavoritesString);
		}
	} catch (error) {
		console.error("Error parsing favorited cards from localStorage:", error);
	}

	if (favoritedCards.length > 0) {
		data = favoritedCards.map((item) => {
			return {
				Name: item.cardFilterName,
				URL: item.cardUrl,
				"Creator Name": item.cardContentCreatorName,
				useCounts: item.useCounts,
			};
		});

		showCards();
	} else {
		console.log("No favorited cards found.");
	}
}
function saveArray() {
	localStorage.setItem("favoritedCards", JSON.stringify(favoritedCards));
}

function pushAndSave(item) {
	console.log(item);
	const res = favoritedCards.some((el) => shallowEqual(el, item));
	console.log("Here is the res: ", res);
	if (!res) {
		favoritedCards.push(item);
		alert(`Added ${item.cardContentCreatorName}`);
		saveArray();
	} else {
		alert("Already in your favorites");
		return;
	}
}
console.log(favoritedCards);

document.addEventListener("DOMContentLoaded", async () => {
	await loadData();
	console.log(isFavoritedAllowed);
	console.log(data);

	const containerForCards = document.getElementById("container__cards");
	containerForCards.addEventListener("click", (event) => {
		let clickedCard = event.target.closest(".card-container");
		if (clickedCard) {
			const cardId = clickedCard.getAttribute("data-card-id");
			const cardContentCreatorName = clickedCard.getAttribute("creator-name");
			const cardUrl = clickedCard.getAttribute("url");
			const cardFilterName = clickedCard.getAttribute("name");
			const useCounts = clickedCard.getAttribute("useCounts");
			console.log(cardId, cardContentCreatorName, cardUrl, cardFilterName);
			console.log(isFavoritedAllowed);
			if (isFavoritedAllowed) {
				alert(`${cardFilterName} deleted from favorites`);
				deleteCard(cardId);
			} else {
				pushAndSave({
					cardId: Number(cardId),
					cardContentCreatorName: cardContentCreatorName,
					cardUrl: cardUrl,
					cardFilterName: cardFilterName,
					useCounts: Number(useCounts),
				});
			}
		}
	});

	document
		.getElementById("sortButtonCreatorName")
		.addEventListener("click", () => {
			sortDataAndRender("Creator Name");
		});

	document
		.getElementById("sortButtonFilterName")
		.addEventListener("click", () => {
			sortDataAndRender("Name");
		});
	document
		.getElementById("sortButtonPopularity")
		.addEventListener("click", () => {
			sortDataAndRender("useCounts");
		});
	document.getElementById("favoriteLenses").addEventListener("click", () => {
		isFavoritedAllowed = !isFavoritedAllowed;
		console.log(isFavoritedAllowed);
		const changeMyLenses = document.getElementById("favoriteLenses");
		const changeDeleteOrFavorite = document.querySelector(".favoriteDelete");

		// Now check the updated state of isFavoritedAllowed to determine the action
		if (isFavoritedAllowed) {
			showFavorites();
			changeMyLenses.innerHTML = "Back to lenses";
			changeDeleteOrFavorite.innerHTML = "Click on lense to delete";
		} else {
			showAllCards(); // Ensure this function shows all cards correctly
			changeMyLenses.innerHTML = "My Lenses";
			changeDeleteOrFavorite.innerHTML = "Click on Lense to add";
		}
	});
	const input = document.getElementById("textbox");
	input.addEventListener("keypress", function (event) {
		console.log(input.value);
		if (event.key === "Enter" && input.value != "") {
			event.preventDefault();
			console.log("Input is favAllowed: ", isFavoritedAllowed);
			console.log(input.value.toLowerCase());
			if (!isFavoritedAllowed) {
				const nameRes = data.filter((item) => {
					if (item.Name == null) {
						return;
					}
					return item.Name.toLowerCase() === input.value.toLowerCase();
				});
				data = nameRes;
				console.log(data);
				clearCards()
				showCards();
			}
		}
	});
});
function toggleDropDown() {
	document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
	if (!event.target.matches(".dropbtn")) {
		let dropdowns = document.getElementsByClassName("dropdown-content");
		let i;
		for (i = 0; i < dropdowns.length; i++) {
			let openDropdown = dropdowns[i];
			if (openDropdown.classList.contains("show")) {
				openDropdown.classList.remove("show");
			}
		}
	}
};

window.onclick = function (event) {
	if (!event.target.matches(".dropbtn")) {
		let dropdowns = document.getElementsByClassName("card-container");
		let i;
		for (i = 0; i < dropdowns.length; i++) {
			let openDropdown = dropdowns[i];
			if (openDropdown.classList.contains("show")) {
				openDropdown.classList.remove("show");
			}
		}
	}
};
