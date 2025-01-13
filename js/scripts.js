const filterBtn = document.querySelector("#filter-select");
const categoryIcons = {
  planets: "fas fa-globe",
  meteors: "fas fa-meteor",
  moon: "fas fa-moon",
};

// Função para criar o elemento
function createElement(tag, classes = [], html = "") {
  const elem = document.createElement(tag);
  if (classes.length) elem.classList.add(...classes);
  if (html) elem.innerHTML = html;
  return elem;
}

// Função para criar a estrutura .mes
function createMonthStructure(monthName, events) {
  const monthDiv = createElement("div", ["mes"]);
  setTimeout(() => monthDiv.classList.add("mostrar"), 100);
  const containerH2 = createElement(
    "div",
    ["container-h2"],
    `<i class="fas fa-calendar-alt calendar-iconTwo"></i><h2>${monthName}</h2>`
  );
  monthDiv.appendChild(containerH2);
  const containerEvents = createElement("div", ["container-events"]);
  monthDiv.appendChild(containerEvents);
  const ul = createElement("ul");
  events.forEach((event, index) => {
    const id = event.getAttribute("id");
    const date = event.querySelector("data").textContent;
    const title = event.querySelector("title").textContent;
    const categoryElement = event.querySelector("category");
    let categoryId = categoryElement
      ? categoryElement.getAttribute("id")
      : "ID da categoria não disponível.";
    let iconHtml = "";
    switch (categoryId) {
      case "planets":
        iconHtml = '<i class="material-icons">public</i>';
        break;
      case "meteors":
        iconHtml = '<i class="fas fa-meteor"></i>';
        break;
      case "stars":
        iconHtml = '<i class="material-icons">star</i>';
        break;
      case "moon":
        iconHtml = '<i class="fas fa-moon"></i>';
        break;
      default:
        iconHtml = '<i class="material-icons">star</i>';
        break;
    }
    const liContainer = createElement(
      "li",
      [],
      `<span class="star">&#9734;</span> <span class="data">${date}</span> ${iconHtml} <span class="descricao">${title}</span>`
    );
    liContainer.setAttribute("data-id", id);
    liContainer.setAttribute("id", categoryId);
    ul.appendChild(liContainer);
    if (index === 0) {
      liContainer.style.borderTopLeftRadius = "4px";
      liContainer.style.borderTopRightRadius = "4px";
    }
    if (index === events.length - 1) {
      liContainer.style.borderBottomLeftRadius = "4px";
      liContainer.style.borderBottomRightRadius = "4px";
    }
  });
  containerEvents.appendChild(ul);
  return monthDiv;
}

// Função que processa o XML
function processXML(data) {
  const months = data.querySelectorAll("eventos > *");
  const container = document.getElementById("main");
  months.forEach((month) => {
    const monthName = month.tagName;
    const events = month.querySelectorAll("evento");
    const monthDiv = createMonthStructure(monthName, events);
    container.appendChild(monthDiv);
  });
  addClickListeners();
  addFavoriteListeners();
  updateFavorites();
}

// Função para carregar os eventos do arquivo xml
function loadEvents() {
  fetch("xml/dados.xml")
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.text();
    })
    .then((str) => new DOMParser().parseFromString(str, "text/xml"))
    .then((data) => processXML(data))
    .catch((error) => console.error("Error fetching XML:", error));
}

// Função para abrir o modal
function openModal(eventId) {
  fetch("xml/dados.xml")
    .then((response) => response.text())
    .then((str) => new DOMParser().parseFromString(str, "text/xml"))
    .then((data) => {
      const event = data.querySelector(`evento[id="${eventId}"]`);
      if (event) {
        const title = event.querySelector("title")
          ? event.querySelector("title").textContent
          : "";
        const date = event.querySelector("data")
          ? event.querySelector("data").textContent
          : "";
        const details = event.querySelector("details")
          ? `<strong>DETALHES:</strong> ${
              event.querySelector("details").textContent
            }`
          : "<strong>DETAILS:</strong> No details available.";
        const observation = event.querySelector("observation")
          ? `<strong>DICAS DE OBSERVAÇÃO:</strong> ${
              event.querySelector("observation").textContent
            }`
          : "<strong>OBSERVATION TIPS:</strong> No observation tips available.";
        const visibility = event.querySelector("visibility")
          ? `<strong>VISIBILIDADE:</strong> ${
              event.querySelector("visibility").textContent
            }`
          : "<strong>VISIBILITY:</strong> No visibility tips available.";
        const photography = event.querySelector("photography")
          ? `<strong>DICAS DE FOTOGRAFIA:</strong> ${
              event.querySelector("photography").textContent
            }`
          : "<strong>PHOTOGRAPHY TIPS:</strong> No photography tips available.";
        document.getElementById("modal-title").innerText = title;
        document.getElementById("modal-date").innerText = date;
        document.getElementById("modal-details").innerHTML = details;
        document.getElementById("modal-observation").innerHTML = observation;
        document.getElementById("modal-visibility").innerHTML = visibility;
        document.getElementById("modal-photography").innerHTML = photography;
        document.getElementById("modal").style.display = "block";
        document.getElementById("filters").classList.add("hidden");
        document.body.style.position = "fixed";
        document.body.style.top = "0";
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.overflow = "hidden";
        document.body.classList.add("modal-open");
      }
    })
    .catch((error) =>
      console.error("Error fetching event details XML:", error)
    );
}

// Função para filtrar os eventos
const filterEvents = (filterValue) => {
  const months = document.querySelectorAll(".mes");
  months.forEach((month) => {
    const events = month.querySelectorAll("li");
    let visibleEvents = false;
    events.forEach((event) => {
      const eventCategory = event.getAttribute("id");
      const isFavorite = event.classList.contains("favorite");
      if (
        filterValue === "all" ||
        eventCategory === filterValue ||
        (filterValue === "favorite" && isFavorite)
      ) {
        event.style.display = "flex";
        event.style.visibility = "visible";
        visibleEvents = true;
      } else {
        event.style.display = "none";
        event.style.visibility = "hidden";
      }
    });
    month.style.display = visibleEvents ? "block" : "none";
    const visibleItems = Array.from(month.querySelectorAll("li")).filter(
      (li) => li.style.display !== "none"
    );
    if (visibleItems.length > 0) {
      visibleItems[0].style.borderTopLeftRadius = "4px";
      visibleItems[0].style.borderTopRightRadius = "4px";
      visibleItems[visibleItems.length - 1].style.borderBottomLeftRadius =
        "4px";
      visibleItems[visibleItems.length - 1].style.borderBottomRightRadius =
        "4px";
    }
  });
};

// Função para fechar o modal
function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("filters").classList.remove("hidden");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.overflow = "";
  document.body.classList.remove("modal-open");
}

// Função para alternar o favorito
function toggleFavorite(eventId) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const li = document.querySelector(`li[data-id="${eventId}"]`);
  if (!li) {
    console.error(`Element with data-id="${eventId}" not found.`);
    return;
  }
  const star = li.querySelector(".star");
  if (!star) {
    console.error(
      `Element with class 'star' not found inside li with data-id="${eventId}".`
    );
    return;
  }
  const index = favorites.indexOf(eventId);
  if (index === -1) {
    favorites.push(eventId);
    li.classList.add("favorite");
    star.innerHTML = "&#9733;";
  } else {
    favorites.splice(index, 1);
    li.classList.remove("favorite");
    star.innerHTML = "&#9734;";
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}
// Função para abrir o modal ao clicar em alguma li
function addClickListeners() {
  const eventLinks = document.querySelectorAll("li");
  eventLinks.forEach((link) => {
    link.addEventListener("click", function () {
      const eventId = this.getAttribute("data-id");
      openModal(eventId);
    });
  });
}
// Função para verificar qual estrela foi clicada e adicionar ou remover dos favoritos
function addFavoriteListeners() {
  const favorites = document.querySelectorAll(".star");
  favorites.forEach((star) => {
    star.addEventListener("click", function (e) {
      e.stopPropagation();
      const eventId = this.parentNode.getAttribute("data-id");
      toggleFavorite(eventId);
    });
  });
}
// Função para atualizar os favoritos
function updateFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.forEach((eventId) => {
    const li = document.querySelector(`li[data-id="${eventId}"]`);
    if (li) {
      li.classList.add("favorite");
      const star = li.querySelector(".star");
      if (star) {
        star.innerHTML = "&#9733;";
      }
    }
  });
}

window.addEventListener("load", loadEvents);
filterBtn.addEventListener("change", () => filterEvents(filterBtn.value));
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    closeModal();
  }
});
