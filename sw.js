self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "TGA Furniture Alert";
    const options = {
        body: data.body || "ඔබගේ පද්ධතියේ අලුත් පණිවුඩයක් ඇත.",
        icon: "https://via.placeholder.com/128",
        badge: "https://via.placeholder.com/128"
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});