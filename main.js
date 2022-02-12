const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const paginator = document.querySelector("#paginator");
const viewModeChange = document.querySelector("#viewModeChange");
const movies = [];
let keywordMovie = [];
const moviePerPage = 12;
let nowPage = 1;
let nowViewMode = "card";

function renderMovieList(data) {
  if (nowViewMode === "card") {
    let rawHTML = "";
    data.forEach((item) => {
      // title, image
      rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card" style="background-color: #3C3C3C;">
          <img src="${POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title" style="color: lightgray">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-dark btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id='${item.id
        }'>
              More
            </button>
            <button class="btn btn-dark btn-add-favorite" data-id='${item.id
        }'>+</button>
          </div>
        </div>
      </div>
    </div>`;
    });
    dataPanel.innerHTML = rawHTML;
  } else if (nowViewMode === "list") {
    let rawHTML = '<ul class="list-group">';
    data.forEach((item) => {
      // title, image
      rawHTML += `<li class="list-group-item justify-content-between d-flex mb-1" style="background-color:#3C3C3C; border:0px; color:lightgray;">
    <h4 class="fw-bold">${item.title}</h4>
    <div>
      <button class="btn btn-dark btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id='${item.id}'>More</button>
      <button class="btn btn-dark btn-add-favorite" data-id='${item.id}'>+</button>
    </div>
  </li>`;
    });
    rawHTML += "</ul>";
    dataPanel.innerHTML = rawHTML;
  }
}

function renderModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImg = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then(function (response) {
    const movie = response.data.results;
    modalTitle.innerText = movie.title;
    modalImg.innerHTML = `<img src="${POSTER_URL + movie.image
      }" alt="movie-poster" class="img-fluid">`;
    modalDate.innerText = "Release date: " + movie.release_date;
    modalDescription.innerText = movie.description;
  });
}

function renderPaginator(list) {
  const allPages = Math.ceil(list.length / moviePerPage);
  let rawHTML = "";
  for (let page = 1; page <= allPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" style="background-color:#3C3C3C; border:gray; color:lightgray;" data-id="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

dataPanel.addEventListener("click", function (event) {
  if (event.target.matches(".btn-show-movie")) {
    renderModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

function byPage(list) {
  return list.slice(
    (nowPage - 1) * moviePerPage,
    (nowPage - 1) * moviePerPage + moviePerPage
  );
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  keywordMovie = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  renderMovieList(byPage(keywordMovie));
  renderPaginator(keywordMovie);
});

paginator.addEventListener("click", function (event) {
  if (event.target.matches(".page-link")) {
    nowPage = event.target.dataset.id;
    if (keywordMovie.length != 0) {
      renderMovieList(byPage(keywordMovie));
    } else {
      renderMovieList(byPage(movies));
    }
  }
});

viewModeChange.addEventListener("click", function (event) {
  if (event.target.matches(".fa-th")) {
    nowViewMode = "card";
  } else if (event.target.matches(".fa-list")) {
    nowViewMode = "list";
  }
  if (keywordMovie.length != 0) {
    renderMovieList(byPage(keywordMovie));
  } else {
    renderMovieList(byPage(movies));
  }
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderMovieList(byPage(movies));
    renderPaginator(movies);
  })
  .catch((err) => console.log(err));
