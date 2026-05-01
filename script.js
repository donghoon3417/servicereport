import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCyNwzCsG2UoDmpJbhQuFlDUWZ6p8Y-uHU",
    authDomain: "servicereport-c621b.firebaseapp.com",
    projectId: "servicereport-c621b",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const currentYear = "2026";

/* 초기 데이터 */
export async function initData() {
    const months = ["합계", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

    for (const m of months) {
        for (let i = 0; i < 5; i++) {
            const ref = doc(db, "volunteer", currentYear, "months", m, "rows", String(i));

            await setDoc(ref, {
                name: `이름${i}`,
                date: `날짜${i}`,
                time: "",
                study: "",
                memo: ""
            });
        }
    }
}

/* 제목 */
export async function loadTitleData() {
    const ref = doc(db, "volunteer", currentYear, "meta", "info");
    const snap = await getDoc(ref);

    return snap.exists()
        ? snap.data().year + " 봉사보고"
        : currentYear + " 봉사보고";
}

/* 월 데이터 실시간 */
export function subscribeMonth(sheet, callback) {
    const colRef = collection(db, "volunteer", currentYear, "months", sheet, "rows");

    return onSnapshot(colRef, (snapshot) => {
        const rows = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
        callback(rows);
    });
}

/* 전체 데이터 */
export async function getAllData() {
    const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    let allRows = [];

    for (const m of months) {
        const colRef = collection(db, "volunteer", currentYear, "months", m, "rows");
        const snapshot = await getDocs(colRef);

        snapshot.forEach(doc => {
            allRows.push({ ...doc.data() });
        });
    }

    return allRows;
}

/* 저장 */
export async function saveRow(sheet, docId, newData) {
    const ref = doc(db, "volunteer", currentYear, "months", sheet, "rows", docId);
    await setDoc(ref, newData);
}