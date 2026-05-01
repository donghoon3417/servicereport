import {
    currentYear,
    loadTitleData,
    subscribeMonth,
    getAllData,
    saveRow,
    initData   // ⭐ 콤마 추가
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

    const study = prompt("연구 (선택)", row.study || "") || "";
    const memo = prompt("비고 (선택)", row.memo || "") || "";

    saveRow(sheet, row.id, {
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

    const daysInMonth = new Date(currentYear, sheet, 0).getDate();

    table.innerHTML += `
    <tr><td></td><td>합계</td><td id="sum">0</td><td></td><td></td><td></td></tr>
    <tr>
        <td>번호</td>
        <td>날짜</td>
        <td>요일</td>
        <td>시간</td>
        <td>연구</td>
        <td>비고</td>
        <td>수정</td>
    </tr>
  `;

    for (let day = 1; day <= daysInMonth; day++) {

        const r = rows.find(r => Number(r.id) === day - 1) || { id: String(day - 1) };

        const dateObj = new Date(currentYear, sheet - 1, day);

        const dateStr = `${currentYear}-${sheet}-${day}`;
        const week = dateObj.toLocaleDateString("ko-KR", { weekday: "long" });

        const time = Number(r.time || 0);
        total += time;

        table.innerHTML += `
<tr>
  <td>${day}</td>
  <td>${dateStr}</td>
  <td>${week}</td>
  <td>${r.time || ""}</td>
  <td>${r.study || ""}</td>
  <td>${r.memo || ""}</td>
  <td>
    <button onclick='window.editRowHandler(${JSON.stringify({
            sheet,
            id: String(day - 1),
            ...r
        })})'>
      수정
    </button>
  </td>
</tr>
`;
    }

    document.getElementById("sum").textContent = total;
}

/* 합계 */
async function renderSummary() {
    const table = document.getElementById("volunteerTable");
    table.innerHTML = "";

    const all = await getAllData();

    let totalTime = 0;
    let totalStudy = 0;

    table.innerHTML = `
      <tr>
        <th>번호</th>
        <th>연월</th>
        <th>시간</th>
        <th>연구</th>
        <th>비고</th>
        <th>최종시간</th>
        <th>부족시간</th>
      </tr>
    `;

    for (let month = 1; month <= 12; month++) {
        const rows = all.filter(r => Number(r.month) === month);

        let monthTime = 0;
        let monthStudy = 0;

        rows.forEach(r => {
            monthTime += Number(r.time || 0);
            monthStudy += Number(r.study || 0);
        });

        const final = monthTime + monthStudy;

        totalTime += monthTime;
        totalStudy += monthStudy;

        table.innerHTML += `
          <tr>
            <td>${month}</td>
            <td>${currentYear}.${month}</td>
            <td>${monthTime}</td>
            <td>${monthStudy}</td>
            <td></td>
            <td>${final}</td>
            <td></td>
          </tr>
        `;
    }

    table.innerHTML += `
      <tr style="font-weight:bold;">
        <td colspan="2">합계</td>
        <td>${totalTime}</td>
        <td>${totalStudy}</td>
        <td></td>
        <td>${totalTime + totalStudy}</td>
        <td></td>
      </tr>
    `;
}

function generateTable(year, month) {
    const table = document.getElementById("volunteerTable");
    table.innerHTML = "";

    const daysInMonth = new Date(year, month, 0).getDate();

    // 헤더
    const header = `
    <tr>
      <th>번호</th>
      <th>날짜</th>
      <th>요일</th>
      <th>시간</th>
      <th>연구</th>
      <th>비고</th>
      <th>수정</th>
    </tr>
  `;
    table.insertAdjacentHTML("beforeend", header);

    const weekNames = ["일", "월", "화", "수", "목", "금", "토"];

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const week = weekNames[date.getDay()];

        const row = `
      <tr>
        <td>${day}</td>
        <td>${year}-${month}-${day}</td>
        <td>${week}요일</td>
        <td></td>
        <td></td>
        <td></td>
        <td><button>수정</button></td>
      </tr>
    `;
        table.insertAdjacentHTML("beforeend", row);
    }
}

document.querySelectorAll("#sheetButtons button").forEach(btn => {
    btn.addEventListener("click", () => {
        const month = parseInt(btn.textContent);
        generateTable(2026, month);
    });
});
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

    if (!localStorage.getItem("initDone")) {
        console.log("init 실행됨");
        initData();
        localStorage.setItem("initDone", "true");
    }
};