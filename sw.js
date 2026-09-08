self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "TGA Furniture Alert";
    const options = {
        body: data.body || "There is a new message in your system.",
        icon: "https://dummyimage.com/128x128/3d2314/ffffff.png&text=TGA",
        badge: "https://dummyimage.com/128x128/3d2314/ffffff.png&text=TGA"
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});