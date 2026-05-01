import {
    currentYear,
    loadTitleData,
    subscribeMonth,
    getAllData,
    saveRow
} from "./script.js";

/* 버튼 */
function initButtons() {
    const sheets = ["합계", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    const container = document.getElementById("sheetButtons");

    let saved = localStorage.getItem("selectedSheet") || "합계";

    sheets.forEach(s => {
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

/* 제목 */
async function loadTitle() {
    const title = await loadTitleData();
    document.getElementById("mainTitle").textContent = title;
}

/* 수정 */
function editRow(sheet, row) {
    const time = prompt("시간", row.time || "");
    if (time === null) return;

    const study = prompt("연구", row.study || "");
    if (study === null) return;

    const memo = prompt("비고", row.memo || "");
    if (memo === null) return;

    saveRow(sheet, row.id, {
        ...row,
        time,
        study,
        memo
    });
}

/* 월 테이블 */
function renderMonth(rows, sheet) {
    const table = document.getElementById("volunteerTable");
    table.innerHTML = "";

    let total = 0;

    table.innerHTML += `
    <tr><td></td><td>합계</td><td id="sum">0</td><td></td><td></td><td></td></tr>
    <tr><td>번호</td><td>요일</td><td>시간</td><td>연구</td><td>비고</td><td>수정</td></tr>
  `;

    rows.forEach((r, i) => {
        const time = Number(r.time || 0);
        total += time;

        const date = new Date(currentYear, sheet - 1, i + 1)
            .toLocaleDateString("ko-KR", { weekday: "long" });

        table.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${date}</td>
        <td>${r.time || ""}</td>
        <td>${r.study || ""}</td>
        <td>${r.memo || ""}</td>
        <td><button onclick='window.editRowHandler(${JSON.stringify({ sheet, ...r })})'>수정</button></td>
      </tr>
    `;
    });

    document.getElementById("sum").textContent = total;
}

/* 합계 */
async function renderSummary() {
    const table = document.getElementById("volunteerTable");
    table.innerHTML = "";

    const rows = await getAllData();

    let t = 0, s = 0;

    rows.forEach(r => {
        t += Number(r.time || 0);
        s += Number(r.study || 0);
    });

    const final = t + s;

    table.innerHTML = `
    <tr><td>${currentYear}</td><td>합계</td><td>${t}</td><td>${s}</td><td></td><td>${final}</td></tr>
  `;
}

/* 테이블 로드 */
function loadTable() {
    const sheet = localStorage.getItem("selectedSheet") || "합계";

    if (sheet === "합계") {
        renderSummary();
    } else {
        subscribeMonth(sheet, rows => renderMonth(rows, sheet));
    }
}

/* 전역 연결 */
window.editRowHandler = (data) => {
    editRow(data.sheet, data);
};

/* 시작 */
window.onload = () => {
    initButtons();
    loadTitle();
    loadTable();
};