self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "TGA Furniture Alert";
    const options = {
        body: data.body || "ඔබගේ පද්ධතියේ අලුත් පණිවුඩයක් ඇත.",
        icon: "https://dummyimage.com/128x128/3d2314/ffffff.png&text=TGA",
        badge: "https://dummyimage.com/128x128/3d2314/ffffff.png&text=TGA"
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});