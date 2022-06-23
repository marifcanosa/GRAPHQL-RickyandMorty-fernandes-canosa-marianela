const VERSION = 'version1';

importScripts(
    "https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js"
);

if (workbox){
    self.addEventListener("message", (event)=>{
        if(event.data && event.data.type === "SKIP_WAITING"){
            self.skipWaiting();
        }
    });

    workbox.routing.registerRoute(
        new RegExp('/*'),
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: VERSION
        })
    )
} else {
    console.log('No funca');
}