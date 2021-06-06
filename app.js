gapi.load('client', start);
const key = "cbfcb9d";
const host = `https://www.omdbapi.com/?apikey=${key}&type=movie&s=`;
const defaultSearchString = "Type movie title here!";

const textField = document.querySelector("input");
textField.value = defaultSearchString;
const searchField = document.querySelector(".searchField");
const movieSection = document.querySelector("#movieSection");

const form = document.querySelector("#form");

textField.addEventListener("input", typed);
textField.classList.remove("d-none");

textField.onclick = ClearDefaultString;

function start()
{
    gapi.client.init({
        'apiKey': 'AIzaSyAgvCTkXSuu6Hb52BsyJyA9obD8vHVfJTA',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
    });
}


form.addEventListener("submit", (event) => event.preventDefault());
let currentTimeout;

function ClearDefaultString()
{
    if (textField.value == defaultSearchString)
        textField.value = '';
}

function typed()
{
    movieSection.innerHTML = '';
    window.clearTimeout(currentTimeout);
    if (searchField.value === "")
        return;
    movieSection.innerHTML = '<img class="col-md-4" src="./loading.gif" alt="loading...">';

    currentTimeout = window.setTimeout(async () => 
    {
        const movies = await FetchMovies(searchField.value);
        if (movies.Error)
        {
            movieSection.innerHTML = `<div class="alert alert-danger" role="alert">
            Could not find any movies with the following title: <em style="color:red">${searchField.value}</em>
          </div>`;
            return;
        }
        let html = '';
        movies.Search.sort((x, y) => y.Year - x.Year);
        movies.Search.forEach((element) =>
        {
            const imageContainer = document.createElement("imageContainer");
            imageContainer.className = "card-img-top";
            imageContainer.innerHTML = '<img src="./loading.gif" style="max-height: 460px" alt="loading...">';

            html +=
                `<div class="card hani col-md-4 d-flex" data-id=${element.imdbID} data-query="${element.Title} trailer ${element.Year}">
                ${imageContainer.outerHTML}
                <div class="card-body d-flex flex-column">
                <h5 class="card-title">${element.Title}</h5>
                <p class="card-text">${element.Year}</p>
                <a class="text-white btn btn-primary mt-auto trailer">Watch Trailer</a>
            </div>
          </div>`
        });

        movieSection.innerHTML = html;

        //get all cards containers on page
        for (const card of document.getElementsByClassName("hani"))
        {
            const movieObject = movies.Search.find(movie => movie.imdbID === card.dataset.id);
            const imageContainer = card.querySelector("imageContainer");
            const imageLoaded = document.createElement("img");
            imageLoaded.className = "card-img-top";
            imageLoaded.onload = () =>
            {
                imageContainer.innerHTML = imageLoaded.outerHTML;
            }
            imageLoaded.onerror = () =>
            {
                imageContainer.innerHTML = '<h1 style="min-height: 460px" class="alert alert-danger">ERROR POSTER NOT FOUND</h1>';
            }
            imageLoaded.src = movieObject.Poster;

            const btn = card.querySelector("a");
            btn.addEventListener("click", async (event) =>
            {
                if (!GapiLoaded())
                {
                    return;
                }

                btn.classList.add("disabled");
                event.preventDefault();
                const request = await gapi.client.youtube.search.list({ part: 'snippet', q: card.dataset.query, maxResults: 1 });
                const result = request.result.items;
                const trailerUrl = "https://www.youtube.com/watch?v=" + result[0].id.videoId;
                window.open(trailerUrl);
                btn.classList.remove("disabled");
            })
        }
    }
        , 1000);
}

function GapiLoaded()
{
    return gapi.client !== undefined && gapi.client.youtube !== undefined;
}
async function FetchMovies(movieTitle)
{
    console.log(host + movieTitle);

    var result = await fetch(host + movieTitle);
    var data = await result.json();
    return data
}
