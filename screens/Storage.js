import { auth, db } from '../firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

export const Storage = {
  async loadBeats() {
    try {
      const userId = auth.currentUser.uid;
      if (!userId) return [];

      const beatsCollectionRef = collection(db, "users", userId, "beats");
      const querySnapshot = await getDocs(beatsCollectionRef);
      const beats = [];
      querySnapshot.forEach((doc) => {
        const beatData = doc.data();
        if (beatData.tempo) {
          beatData.tempo = parseFloat(beatData.tempo);
        }
        beats.push(beatData);
      });
      return beats;
    } catch (error) {
      console.error('Error loading beats:', error);
      return [];
    }
  },
  
  async saveBeat(beatData) {
    try {
      const userId = auth.currentUser.uid;
      if (!userId) return null;

      const beatId = Date.now().toString();
      const beatDocRef = doc(db, "users", userId, "beats", beatId);
      const newBeat = {
        ...beatData,
        id: beatId,
        timestamp: Date.now()
      };
      await setDoc(beatDocRef, newBeat);
      return newBeat;
    } catch (error) {
      console.error('Error saving beat:', error);
      return null;
    }
  },
  
  async deleteBeat(beatId) {
    try {
      const userId = auth.currentUser.uid;
      if (!userId) return false;

      const beatDocRef = doc(db, "users", userId, "beats", beatId);
      await deleteDoc(beatDocRef);
      return true;
    } catch (error) {
      console.error('Error deleting beat:', error);
      return false;
    }
  }
};
