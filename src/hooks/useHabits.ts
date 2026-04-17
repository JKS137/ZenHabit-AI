import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, getDocs, setDoc } from 'firebase/firestore';
import { useAuth } from '../components/auth/AuthContext';
import { format, startOfToday } from 'date-fns';

export interface Habit {
  id: string;
  uid: string;
  name: string;
  goalValue: number;
  unit: string;
  frequency: string;
  createdAt: any;
}

export interface HabitLog {
  id: string;
  habitId: string;
  uid: string;
  date: string;
  timestamp?: any;
  value: number;
  completed: boolean;
}

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    const habitsRef = collection(db, 'habits');
    const qHabits = query(habitsRef, where('uid', '==', user.uid));
    
    const unsubHabits = onSnapshot(qHabits, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      setHabits(data);
    });

    const logsRef = collection(db, 'habitLogs');
    const qLogs = query(logsRef, where('uid', '==', user.uid));
    
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HabitLog));
      setLogs(data);
      setLoading(false);
    });

    return () => {
      unsubHabits();
      unsubLogs();
    };
  }, [user]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'uid' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'habits'), {
      ...habit,
      uid: user.uid,
      createdAt: serverTimestamp()
    });
  };

  const toggleHabit = async (habitId: string, currentVal: number, goalVal: number) => {
    if (!user) return;
    const today = format(startOfToday(), 'yyyy-MM-dd');
    const logsRef = collection(db, 'habitLogs');
    const q = query(logsRef, where('uid', '==', user.uid), where('habitId', '==', habitId), where('date', '==', today));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await addDoc(collection(db, 'habitLogs'), {
        uid: user.uid,
        habitId,
        date: today,
        timestamp: serverTimestamp(),
        value: goalVal, // Simplification: set to goal if toggled
        completed: true
      });
      
      // Update points
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        points: (await (await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)))).docs[0].data().points || 0) + 10
      });
    } else {
      const logDoc = snapshot.docs[0];
      await deleteDoc(doc(db, 'habitLogs', logDoc.id));
    }
  };

  const deleteHabit = async (id: string) => {
    await deleteDoc(doc(db, 'habits', id));
  };

  return { habits, logs, loading, addHabit, toggleHabit, deleteHabit };
}
