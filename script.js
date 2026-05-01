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

        // ⭐ 이거 추가 (상위 문서 생성)
        const monthRef = doc(db, "volunteer", currentYear, "months", m);
        await setDoc(monthRef, { created: true }, { merge: true });

     for (let i = 0; i < 31; i++) {
    const ref = doc(db, "volunteer", currentYear, "months", m, "rows", String(i));

    await setDoc(ref, {
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
            allRows.push({
                month: m,      // ⭐ 이거 추가
                id: doc.id,    // ⭐ 이것도 추가 (중요)
                ...doc.data()
            });
        });
    }

    return allRows;
}

/* 저장 */
export async function saveRow(sheet, docId, newData) {
    const ref = doc(
        db,
        "volunteer",
        currentYear,
        "months",
        sheet,
        "rows",
        String(docId)   // ⭐ 무조건 문자열
    );

    await setDoc(ref, newData, { merge: true }); // ⭐ 덮어쓰기 방지
}