class Movie {
    constructor(name, description, watchers, rating) {
        this.name = name;
        this.description = description;
        this.watchers = watchers;
        this.rating = rating;
    }
}

const urlParams = new URLSearchParams(window.location.search)
const moviesCountParam = urlParams.getAll('c')[0]
const moviesCount = (typeof moviesCountParam === 'undefined') ? 10 : moviesCountParam;
const random = new RNG(urlParams.getAll('seed')[0])

const movieContainer = document.getElementById('movies')
const timerElement = document.getElementById('timer')
const startButton = document.getElementById('start-btn')
const messageElement = document.getElementById('message')

let gameStarted = false
let startTime
let movies = []
let penalty = 0
let timerInterval

function startGame() {
    startButton.style.visibility = 'hidden'
    timerElement.textContent = '0 seconds';
    penalty = 0
    movieContainer.style.display = 'block'
    generateMovies()
    movieContainer.innerHTML = generateMoviesHtml();
    startTimer();
    messageElement.textContent = '';
    gameStarted = true;
    startTime = new Date().getTime();
}

function generateMovies() {
    for (let i = 0; i < moviesCount; i++) {
        let movie = new Movie(
            faker.commerce.productName(),
            faker.commerce.productName(),
            Math.floor(random.nextRange(0, 100000000)),
            Math.floor(random.nextRange(3, 10)),
            i
        );
        movies.push(movie)
    }
}

function generateMoviesHtml() {
    let movieList = ''

    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i]
        movieList += `<div class="movie">
                        <h3>${movie.name}</h3>
                        <p>${movie.description}</p>
                        <p>Watched: ${movie.watchers}</p>
                        <p>Rating: ${movie.rating}</p>
                        <button class="btn-large waves-effect waves-light" onclick="selectMovie(${i})">Select</button>
                    </div>`;
    }

    return movieList;
}

function selectMovie(index) {
    if (!gameStarted) {
        return;
    }

    const selectedMovie = movies[index];
    if (selectedMovie.rating >= 7) {
        movies.splice(index, 1);
        movieContainer.innerHTML = generateMoviesHtml();
    } else {
        penalty += 0.51
    }

    if (!movies.find(m => m.rating >= 7)) {
        endGame();
    }
}

function endGame() {
    let timePrecise = (new Date().getTime() + penalty - startTime) / 1000;
    let totalTime = round(timePrecise, 0.3)
    timerElement.textContent = `${totalTime} seconds`;
    messageElement.textContent = `Congratulations! You completed the game in ${totalTime} seconds`;
    if (penalty > 0) {
        messageElement.textContent += ` (with penalty)`;
    }
    gameStarted = false;
    clearInterval(timerInterval);
    movieContainer.style.display = 'none'
    startButton.style.visibility = 'visible'
    startButton.textContent = 'Restart game'
    movies = []
}

function startTimer() {
    let elapsedSeconds = 0;

    timerInterval = setInterval(() => {
        elapsedSeconds++;
        timerElement.textContent = `${elapsedSeconds + penalty} seconds`;
    }, 1000);
}

function round(value, step) {
    step || (step = 1.0);
    let inv = 1.0 / step;
    return (Math.round(value * inv) / inv).toString().substring(0, 5);
}

function RNG(seed) {
    // LCG using GCC's constants
    this.m = 0x80000000; // 2**31;
    this.a = 1103515245;
    this.c = 12345;

    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}

RNG.prototype.nextInt = function () {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
}

RNG.prototype.nextRange = function (start, end) {
    // returns in range [start, end): including start, excluding end
    // can't modulu nextInt because of weak randomness in lower bits
    let rangeSize = end - start;
    let randomUnder1 = this.nextInt() / this.m;
    return start + Math.floor(randomUnder1 * rangeSize);
}