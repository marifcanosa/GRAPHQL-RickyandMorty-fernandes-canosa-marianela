if ('serviceWorker' in navigator){
    navigator.serviceWorker.register("../sw.js").then((message)=>{
    });
} else {
    console.log('Service worker no es soportado');
}