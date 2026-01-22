// services/device/haptics.ts

export const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        switch (pattern) {
            case 'light':
                navigator.vibrate(10); // Klik ringan
                break;
            case 'medium':
                navigator.vibrate(20); // Tombol navigasi
                break;
            case 'heavy':
                navigator.vibrate(40); // Aksi penting
                break;
            case 'success':
                navigator.vibrate([10, 30, 10]); // Pola sukses
                break;
            case 'error':
                navigator.vibrate([50, 30, 50, 30, 50]); // Pola error
                break;
        }
    }
};