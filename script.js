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
    storageBucket: "servicereport-c621b.firebasestorage.app",
    messagingSenderId: "484175382316",
    appId: "1:484175382316:web:6e664d484a678ca1dfce89",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentYear = "2026";

/* 초기 데이터 */
async function initData() {
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
async function loadTitle() {
    const ref = doc(db, "volunteer", currentYear, "meta", "info");
    const snap = await getDoc(ref);

    document.getElementById("mainTitle").textContent =
        snap.exists() ? snap.data().year + " 봉사보고" : currentYear + " 봉사보고";
}

/* 버튼 */
function initButtons() {
    const sheets = ["합계", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    const container = document.getElementById("sheetButtons");

    let saved = localStorage.getItem("selectedSheet") || "합계";

    sheets.forEach((s) => {
        const btn = document.createElement("button");
        btn.textContent = s === "합계" ? "합계" : s + "월";

        if (s === saved) btn.classList.add("active");

        btn.onclick = () => {
            localStorage.setItem("selectedSheet", s);
            location.reload();
        };

        container.appendChild(btn);
    });
}

function editRow(docId, row) {
    const time = prompt("시간", row.time || "");
    if (time === null) return;

    const study = prompt("연구", row.study || "");
    if (study === null) return;

    const memo = prompt("비고", row.memo || "");
    if (memo === null) return;

    saveRow(docId, {
        ...row,
        time: time === "" ? row.time : time,
        study: study === "" ? row.study : study,
        memo: memo === "" ? row.memo : memo
    });
}

async function saveRow(docId, newData) {
    const sheet = localStorage.getItem("selectedSheet");

    const ref = doc(
        db,
        "volunteer",
        currentYear,
        "months",
        sheet,
        "rows",
        docId
    );

    await setDoc(ref, newData);
}

/* 테이블 */
function loadTable() {
    const sheet = localStorage.getItem("selectedSheet") || "합계";

    if (sheet === "합계") {
        loadSummary();
        return;
    }

    const colRef = collection(
        db,
        "volunteer",
        currentYear,
        "months",
        sheet,
        "rows"
    );

    onSnapshot(colRef, (snapshot) => {
        const table = document.getElementById("volunteerTable");
        table.innerHTML = "";

        let totalTime = 0;

        // 🔥 1️⃣ 상단 합계 헤더
        const header1 = document.createElement("tr");
        header1.innerHTML = `
      <td></td>
      <td>합계</td>
      <td id="sumTime">0</td>
      <td></td>
      <td></td>
      <td></td>
    `;
        table.appendChild(header1);

        // 🔥 2️⃣ 컬럼 헤더
        const header2 = document.createElement("tr");
        header2.innerHTML = `
      <td>번호</td>
      <td>요일</td>
      <td>시간</td>
      <td>연구</td>
      <td>비고</td>
      <td>수정</td>
    `;
        table.appendChild(header2);

        // 🔥 날짜 생성용
        const year = Number(currentYear);
        const month = Number(sheet);

        snapshot.docs.forEach((d, index) => {
            const row = d.data();
            const tr = document.createElement("tr");

            // 🔥 날짜 자동 생성 (GAS 스타일)
            const dateObj = new Date(year, month - 1, index + 1);
            const weekday = dateObj.toLocaleDateString("ko-KR", { weekday: "long" });

            const dateStr = `${weekday}, ${month}월 ${String(index + 1).padStart(2, "0")}, ${year}`;

            const time = Number(row.time || 0);
            totalTime += time;

            tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${dateStr}</td>
        <td>${row.time || ""}</td>
        <td>${row.study || ""}</td>
        <td>${row.memo || ""}</td>
        <td><button onclick="editRow('${d.id}', ${JSON.stringify(row).replace(/"/g, '&quot;')})">수정</button></td>
      `;

            table.appendChild(tr);
        });

        // 🔥 합계 업데이트
        document.getElementById("sumTime").textContent = totalTime;
    });
}

/* 합계 */
async function loadSummary() {
    const table = document.getElementById("volunteerTable");
    table.innerHTML = "";

    let totalTime = 0;
    let totalStudy = 0;

    const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    let allRows = [];

    for (const m of months) {
        const colRef = collection(db, "volunteer", currentYear, "months", m, "rows");
        const snapshot = await getDocs(colRef);

        snapshot.forEach(doc => {
            const data = doc.data();
            totalTime += Number(data.time || 0);
            totalStudy += Number(data.study || 0);
            allRows.push({ ...data });
        });
    }

    const finalTime = totalTime + totalStudy;
    const lack = 400 - finalTime;

    table.innerHTML += `
    <tr>
      <td>${currentYear}</td>
      <td>합계</td>
      <td>${totalTime}</td>
      <td>${totalStudy}</td>
      <td></td>
      <td>${finalTime}</td>
      <td>${lack}</td>
    </tr>
    <tr>
      <td>번호</td><td>날짜</td><td>시간</td><td>연구</td><td>비고</td><td>최종</td><td>부족</td>
    </tr>
  `;

    allRows.forEach((r, i) => {
        const final = Number(r.time || 0) + Number(r.study || 0);
        table.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${r.date || ""}</td>
        <td>${r.time || ""}</td>
        <td>${r.study || ""}</td>
        <td>${r.memo || ""}</td>
        <td>${final}</td>
        <td></td>
      </tr>
    `;
    });
}

/* 시작 */
window.onload = () => {
    initButtons();
    loadTitle();
    loadTable();
};

window.initData = initData;