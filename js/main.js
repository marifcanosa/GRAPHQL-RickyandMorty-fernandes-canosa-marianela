var divs   = document.getElementsByClassName('offline');

for (let div of divs) {
    window.addEventListener('offline', event => {
        console.log('Estoy Offline!');
        div.style.display = "block";
    })
    
    window.addEventListener('online', event => {
        console.log('Estoy online!');
        div.style.display = "none";
    })
    
}

if (!navigator.onLine){
    alert('¡Estoy sin conexion!');
}

const button          = document.getElementById('sendButton');
const inputElement    = document.getElementById('search');
const resultDiv       = document.getElementById('main');
const divEpisodios    = document.getElementById('episodios');
let   divResultado    = document.getElementById('resultado'); 
let   divFavoritos    = document.getElementById('favoritos');
var   favoritos       = [];
let   divSpinner      = document.getElementById('spinner');
let   divModal        = document.getElementById('modal');
let   divEpis         = document.getElementById('epis');
const buttonEpisodio  = document.getElementById('sendEpisodios'); 
const inputEpisodios  = document.getElementById('search2');
const divBusqueda2     = document.getElementById('busqueda2');
let   estado = false;

//Buscador de personajes
const constructorDeQueryDePersonaje = (personaje) => `query {
    characters(filter: { name: "${personaje}" }) {
        results {
            id
            name
            status
            species
            gender
            type
            image
            created
            episode {
                name
                air_date
                episode
                created
            }
            origin {
                type
                dimension
            }
        }
    }
}`

button.addEventListener('click', (e)=>{
    showSpinner(); 
    divResultado.innerHTML = '';
    const valorDeInput = inputElement.value;
    const options = {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: constructorDeQueryDePersonaje(valorDeInput),
        })
    }

    fetch(`https://rickandmortyapi.com/graphql`, options)
    .then(function (response){
        return response.json();
    }).then(function(json){
        mostrarResultado(json.data);
    })
    .catch(function (err){
        console.log('Algo fallo crack', err);
    })
    e.preventDefault();
});

function mostrarResultado(data) {
    if (data.characters.results.length == 0) {
        divResultado.innerHTML = 'No encontramos el personaje que buscas. Proba nuevamente.'
    }
    hideSpinner();
    let personajes = data.characters.results;
    for (let personaje of personajes) {
        if (personaje.origin.dimension == null) {
            personaje.origin.dimension = 'Desconocido.';
        }
        if (personaje.gender == 'Female') {
            personaje.gender = 'Femenina';
        }
        if (personaje.gender == 'Male') {
            personaje.gender = 'Masculino';
        }
        if (personaje.status == 'Alive') {
            personaje.status = 'Vivo';
        }
        if (personaje.status == 'Dead') {
            personaje.status = 'Muerto';
        }
        if (personaje.status == 'unknown') {
            personaje.status = 'Desconocido';
        }
        if (personaje.species == 'Human') {
            personaje.species = 'Humano';
        }
        if (personaje.species == 'Humanoid') {
            personaje.species = 'Humanoide';
        }
        if (personaje.species == 'Alien') {
            personaje.species = 'Alienigena';
        }

        divResultado.innerHTML += `
        <div class="card" style="width: 15rem;">
        <button value="${personaje.id}" class="favoritos btn btn-success">Agregar a Favoritos</button>
        <img src="${personaje.image}" class="card-img-top" alt="${personaje.name}">
        <div class="card-body">
        <h3>${personaje.name}</h3>
        <ul>
          <li>Género: ${personaje.gender}</li>
          <li>Estado: ${personaje.status}</li>
          <li>Especie: ${personaje.species}</li>
          <li>Origen: ${personaje.origin.dimension}</li>
          <button class="epis btn btn-dark" value="${personaje.name}" >Episodios</button>
        </ul>
        </div>
        </div>`
        let buttons = divResultado.getElementsByClassName('favoritos');
        for (let btn of buttons) {
            btn.addEventListener('click', function(){                
                if (estado == false) {
                    estado = true;
                    agregarFav(btn.value);
                    btn.innerHTML = 'Quitar de Favoritos';
                    btn.style.color = "#ff6666";
                } else {
                    estado = false;
                    quitarFav(btn.value);
                    btn.innerHTML = 'Agregar a Favoritos';
                    btn.style.color = "white";
                }
            });
        }
        let botones = divResultado.getElementsByClassName('epis');
        for (let boton of botones) {
            boton.addEventListener('click', function(){
                let nombre = boton.value;
                mostrarEpisodios(nombre);
            });
        }
    }
}

function mostrarEpisodios(personaje) {
    divEpis.innerHTML = '';
    const options = {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: constructorDeQueryDePersonaje(personaje),
        })
    }

    fetch(`https://rickandmortyapi.com/graphql`, options)
    .then(function (response){
        return response.json();
    }).then(function(json){
        armarModal(json.data.characters.results);
    })
    .catch(function (err){
        console.log('Algo fallo crack', err);
    })
}

function armarModal(data) {
    divModal.style.display = "block";
    let episodios = data[0].episode;
    for (let episodio of episodios) {
        divEpis.innerHTML += `
        <div>
        <h4>Episodio: ${episodio.name}: ${episodio.episode}<h4>
        <p>Fecha de lanzamiento: ${episodio.air_date}</p>
        <div>
        `
    }
    divEpis.innerHTML += `<button onclick="cerrarModal()" class="btn btn-danger" id="cerrar">Cerrar</button>`
}

function cerrarModal() {
    divModal.style.display = "none";
}

function agregarFav(id) {
    fetch(`https://rickandmortyapi.com/api/character/${id}`)
    .then(function (response){
        return response.json();
    }).then(function(json){
        console.log(favoritos);
        favoritos.push(json);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
    })
    .catch(function (err){
        console.log('Algo fallo crack', err);
    })
}

function quitarFav(id) {
    let datos = JSON.parse(localStorage.getItem('favoritos'));
    for (let dato of datos) {
        if (dato.id === parseInt(id)) {
            let indice = datos.indexOf(dato);
            delete datos[indice];
            favoritos = datos.filter(function(i) { return i !== null });
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
        }
    }
}

function armarFavs() {
    let datas = JSON.parse(localStorage.getItem('favoritos'));
    if (datas == null || datas.length == 0) {
        divFavoritos.innerHTML = '<p class="text-center mt-2 fs-4">No hay personajes en favoritos.</p>'
    }
    for (let data of datas) {
        if (data.origin.dimension == null) {
            data.origin.dimension = 'Desconocido.';
        }
        if (data.gender == 'Female') {
            data.gender = 'Femenina';
        }
        if (data.gender == 'Male') {
            data.gender = 'Masculino';
        }
        if (data.status == 'Alive') {
            data.status = 'Vivo';
        }
        if (data.status == 'Dead') {
            data.status = 'Muerto';
        }
        if (data.status == 'unknown') {
            data.status = 'Desconocido';
        }
        if (data.species == 'Human') {
            data.species = 'Humano';
        }
        if (data.species == 'Humanoid') {
            data.species = 'Humanoide';
        }
        if (data.species == 'Alien') {
            data.species = 'Alienigena';
        }
        divFavoritos.innerHTML += `
        <div class="card" style="width: 15rem;">
            <button value="${data.id}" class="favoritos btn btn-success" style="color: #ff6666;">Quitar de Favoritos</button>
            <img src="${data.image}" class="card-img-top" alt="${data.name}">
            <div class="card-body">
            <h3>${data.name}</h3>
            <ul>
              <li>Género: ${data.gender}</li>
              <li>Estado: ${data.status}</li>
              <li>Especie: ${data.species}</li>
              <li>Origen: ${data.origin.dimension}</li>
            </ul>`
            let buttons = divFavoritos.getElementsByClassName('favoritos');
            for (let btn of buttons) {
                btn.addEventListener('click', function(){
                    estado = false;
                    quitarFav(btn.value);
                    location.reload();
                });
            }
    }
}
//Traigo los personajes
fetch('https://rickandmortyapi.com/api/character')
.then(function (response){
    return response.json();
}).then(function(json){
    JSON.stringify(json.data);
    armarPersonajes(json.results);
})
.catch(function (err){
    console.log('Algo fallo crack', err);
})

function armarPersonajes (data) {
    for (let personaje of data) {
        if (personaje.gender == 'Female') {
            personaje.gender = 'Femenina';
        }
        if (personaje.gender == 'Male') {
            personaje.gender = 'Masculino';
        }
        if (personaje.status == 'Alive') {
            personaje.status = 'Vivo';
        }
        if (personaje.status == 'Dead') {
            personaje.status = 'Muerto';
        }
        if (personaje.status == 'unknown') {
            personaje.status = 'Desconocido';
        }
        if (personaje.species == 'Human') {
            personaje.species = 'Humano';
        }
        if (personaje.species == 'Humanoid') {
            personaje.species = 'Humanoide';
        }
        if (personaje.species == 'Alien') {
            personaje.species = 'Alienigena';
        }
        resultDiv.innerHTML += `
        <div class="card" style="width: 15rem;">
        <img src="${personaje.image}" class="card-img-top" alt="${personaje.name}">
        <div class="card-body">
        <h3>${personaje.name}<h3>
        <ul>
          <li>Género: ${personaje.gender}</li>
          <li>Estado: ${personaje.status}</li>
          <li>Especie: ${personaje.species}</li>
        </ul>
        </div>
        </div>`
    }
}

//Traigo los episodios
function episodios() {
    showSpinner();
    fetch('https://rickandmortyapi.com/api/episode')
    .then(function (response){
        return response.json();
    }).then(function(json){
        JSON.stringify(json.data);
        hideSpinner();
        armarEpisodios(json.results);
    })
    .catch(function (err){
        console.log('Algo fallo crack', err);
    })

function armarEpisodios (data) {
    for (let episodio of data) {
        divEpisodios.innerHTML += `
        <div class="card" style="width: 15rem;">
        <div class="card-body">
        <h3>${episodio.name}<h3>
        <ul>
        <li>Fecha: ${episodio.air_date}</li>
        </ul>
        </div>
        </div>`
    }
};

const constructorDeQueryDeEpisodios = (nombreEpisodio) => `query {
    episodes (filter: { name: "${nombreEpisodio}" }) {
      results {
        episode
        name
        id
        air_date
        created
        characters {
          name
        }
      }
    }
}`;

buttonEpisodio.addEventListener('click', (e)=>{
    showSpinner();
    const valorDeInput = inputEpisodios.value;
    const options = {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: constructorDeQueryDeEpisodios(valorDeInput),
        })
    }

    fetch(`https://rickandmortyapi.com/graphql`, options)
    .then(function (response){
        return response.json();
    }).then(function(json){
        mostrarResulEpisodio(json.data.episodes.results);
    })
    .catch(function (err){
        console.log('Algo fallo crack', err);
    })
    e.preventDefault();   
});

function mostrarResulEpisodio(data) {
    let personajesEnEpis = [];
    for (let valor of data) {
        for (let personaje of valor.characters) {
            personajesEnEpis.push(personaje.name);
        }
        divBusqueda2.innerHTML = `
        <div>
        <h2 class="card-title">${valor.name}</h2>
        <p class="card-text">En: ${valor.episode}</p>
        <p class="card-text">Fecha de lanzamiento: ${valor.air_date}</p>
        <div>
        <h3>Personajes que aparecen en el episodio: </h3>
        <p>${personajesEnEpis.toString()}.<p>
        </div>
        </div>
        `
        
    }
}

};


function showSpinner() {
        divSpinner.innerHTML = `
        <div class="text-center">
        <div class="spinner-border spinner" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        </div>`
}

function hideSpinner() {
    divSpinner.innerHTML = '';
}