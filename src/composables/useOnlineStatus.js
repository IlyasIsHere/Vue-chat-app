import { onMounted, onUnmounted } from 'vue';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, updateDoc, serverTimestamp } from 'firebase/firestore';

export function useOnlineStatus() {
  const auth = getAuth();
  const db = getFirestore();

  const updateOnlineStatus = async (status) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        online: status,
        lastSeen: serverTimestamp()
      });
    }
  };

  const handleVisibilityChange = () => {
    updateOnlineStatus(!document.hidden);
  };

  const handleOffline = () => {
    updateOnlineStatus(false);
  };

  const handleOnline = () => {
    updateOnlineStatus(true);
  };

  onMounted(() => {
    // Set initial online status
    updateOnlineStatus(true);

    // Add event listeners
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  });

  onUnmounted(() => {
    // Update status to offline when component unmounts
    updateOnlineStatus(false);

    // Remove event listeners
    window.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  });
}
