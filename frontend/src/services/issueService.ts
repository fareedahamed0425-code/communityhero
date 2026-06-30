import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface IssueData {
  title: string;
  description: string;
  issue_type: string;
  severity: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string;
  status: string;
}

export const createIssue = async (data: IssueData) => {
  try {
    const docRef = await addDoc(collection(db, "issues"), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const getIssues = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "issues"));
    const issues: any[] = [];
    querySnapshot.forEach((doc) => {
      issues.push({ id: doc.id, ...doc.data() });
    });
    return issues;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw e;
  }
};
