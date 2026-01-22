// services/device/notifications.ts

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') return true;
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    return false;
};

export const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
        try {
             // Coba gunakan Service Worker jika tersedia (untuk mobile)
            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        body,
                        icon: 'https://placehold.co/192x192/1e293b/ffffff?text=MB',
                        vibrate: [200, 100, 200]
                    } as any);
                });
            } else {
                // Fallback ke Desktop Notification API biasa
                new Notification(title, { body, icon: '/icon.png' });
            }
        } catch (e) {
            console.error("Gagal mengirim notifikasi", e);
        }
    }
};