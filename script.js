// ============================================================
// 2026 봉사보고
// GitHub Pages Frontend
// Apps Script API + Google Sheets
// ============================================================


// ============================================================
// 🔥 여기에 Apps Script 웹앱 URL 입력
// ============================================================

const API_URL =
  "여기에_새로운_Apps_Script_웹앱_URL_입력";


// ============================================================
// API GET
// ============================================================

async function apiGet(params = {}) {

  const query =
    new URLSearchParams(params);


  const response =
    await fetch(
      `${API_URL}?${query.toString()}`
    );


  if (!response.ok) {

    throw new Error(
      "서버 응답 오류: " +
      response.status
    );

  }


  const result =
    await response.json();


  if (!result.success) {

    throw new Error(
      result.message ||
      "API 오류"
    );

  }


  return result;

}


// ============================================================
// API POST
//
// JSON POST 대신 form-urlencoded 방식 사용
// ============================================================

async function apiPost(params = {}) {

  const body =
    new URLSearchParams();


  Object.keys(params).forEach(key => {

    const value = params[key];

    if (value !== undefined && value !== null) {

      body.append(
        key,
        String(value)
      );

    }

  });


  const response =
    await fetch(
      API_URL,
      {
        method: "POST",
        body: body
      }
    );


  if (!response.ok) {

    throw new Error(
      "서버 응답 오류: " +
      response.status
    );

  }


  const result =
    await response.json();


  if (!result.success) {

    throw new Error(
      result.message ||
      "API 오류"
    );

  }


  return result;

}


// ============================================================
// 초기화
// ============================================================

async function initSheetSelect() {

  try {

    const result =
      await apiGet({
        action: "initial"
      });


    // --------------------------------------------
    // 제목
    // --------------------------------------------

    document
      .getElementById("mainTitle")
      .textContent =
        `${result.year} 봉사보고`;


    // --------------------------------------------
    // 시트 버튼
    // --------------------------------------------

    const container =
      document.getElementById(
        "sheetButtons"
      );


    container.innerHTML = "";


    let saved =
      localStorage.getItem(
        "selectedSheet"
      );


    const row1 =
      document.createElement("div");


    const row2 =
      document.createElement("div");


    row1.className =
      "sheetRow";


    row2.className =
      "sheetRow";


    result.sheets.forEach(s => {

      const btn =
        document.createElement("button");


      btn.textContent =
        (s === "합계")
          ? "합계"
          : `${s}월`;


      if (s === saved) {

        btn.classList.add("active");

      }


      btn.onclick = () => {

        localStorage.setItem(
          "selectedSheet",
          s
        );


        loadTable();


        document
          .querySelectorAll(
            "#sheetButtons button"
          )
          .forEach(b =>
            b.classList.remove("active")
          );


        btn.classList.add("active");

      };


      if (
        s === "합계" ||
        Number(s) <= 6
      ) {

        row1.appendChild(btn);

      } else {

        row2.appendChild(btn);

      }

    });


    container.appendChild(row1);

    container.appendChild(row2);


    // --------------------------------------------
    // 선택된 시트가 없으면 합계
    // --------------------------------------------

    if (
      !saved &&
      result.sheets.length > 0
    ) {

      saved =
        result.sheets[0];


      localStorage.setItem(
        "selectedSheet",
        saved
      );


      document
        .querySelectorAll(
          "#sheetButtons button"
        )
        .forEach(btn => {

          if (
            btn.textContent ===
            (
              saved === "합계"
                ? "합계"
                : `${saved}월`
            )
          ) {

            btn.classList.add(
              "active"
            );

          }

        });

    }


    // --------------------------------------------
    // 테이블
    // --------------------------------------------

    await loadTable();


  } catch (error) {

    console.error(error);

    alert(
      "초기 데이터를 불러오지 못했습니다.\n" +
      error.message
    );

  }

}


// ============================================================
// 테이블 불러오기
// ============================================================

async function loadTable() {

  const sheetName =
    localStorage.getItem(
      "selectedSheet"
    );


  if (!sheetName) return;


  const totalWrap =
    document.getElementById(
      "totalTableWrap"
    );


  const monthWrap =
    document.getElementById(
      "monthTableWrap"
    );


  // --------------------------------------------
  // 합계 / 월 화면 전환
  // --------------------------------------------

  if (sheetName === "합계") {

    totalWrap.style.display =
      "block";


    monthWrap.style.display =
      "none";

  } else {

    totalWrap.style.display =
      "none";


    monthWrap.style.display =
      "block";

  }


  try {

    const result =
      await apiGet({

        action: "data",

        sheet: sheetName

      });


    if (sheetName === "합계") {

      drawTableTotal(
        result.data
      );

    } else {

      drawTableMonth(
        result.data
      );

    }


  } catch (error) {

    console.error(error);

    alert(
      "데이터를 불러오지 못했습니다.\n" +
      error.message
    );

  }

}


// ============================================================
// colgroup
// ============================================================

function getColGroupHTML() {

  return `
    <colgroup>
      <col style="width:50px">
      <col style="width:250px">
      <col style="width:80px">
      <col style="width:80px">
      <col style="width:80px">
      <col style="width:100px">
    </colgroup>
  `;

}


// ============================================================
// 합계
// ============================================================

function drawTableTotal(data) {

  if (!Array.isArray(data)) {

    data = [];

  }


  const header =
    document.getElementById(
      "totalHeaderTable"
    );


  const body =
    document.getElementById(
      "totalBodyTable"
    );


  header.innerHTML =
    getColGroupHTML();


  body.innerHTML =
    getColGroupHTML();


  data.forEach((row, i) => {

    const tr =
      document.createElement("tr");


    row.forEach(cell => {

      const td =
        document.createElement("td");


      td.textContent =
        cell;


      tr.appendChild(td);

    });


    if (i === 0) {

      tr.style.fontWeight =
        "bold";

    }


    if (i === 1) {

      tr.style.background =
        "#ddd";

    }


    if (i < 2) {

      header.appendChild(tr);

    } else {

      body.appendChild(tr);

    }

  });

}


// ============================================================
// 월
// ============================================================

function drawTableMonth(data) {

  if (!Array.isArray(data)) {

    data = [];

  }


  const header =
    document.getElementById(
      "monthHeaderTable"
    );


  const body =
    document.getElementById(
      "monthBodyTable"
    );


  header.innerHTML =
    getColGroupHTML();


  body.innerHTML =
    getColGroupHTML();


  data.forEach((row, i) => {

    const tr =
      document.createElement("tr");


    row.forEach(cell => {

      const td =
        document.createElement("td");


      td.textContent =
        cell;


      tr.appendChild(td);

    });


    // --------------------------------------------
    // 수정 열
    // --------------------------------------------

    const tdActions =
      document.createElement("td");


    if (i === 0) {

      tdActions.textContent = "";

    }

    else if (i === 1) {

      tdActions.textContent =
        "수정";


      tdActions.style.background =
        "#ddd";

    }

    else {

      const btn =
        document.createElement(
          "button"
        );


      btn.textContent =
        "수정";


      btn.onclick = () =>
        editRow(
          i - 2,
          row
        );


      tdActions.appendChild(btn);

    }


    tr.appendChild(
      tdActions
    );


    // --------------------------------------------
    // 스타일
    // --------------------------------------------

    if (i === 0) {

      tr.style.fontWeight =
        "bold";

    }


    if (i === 1) {

      tr.style.background =
        "#ddd";

    }


    // --------------------------------------------
    // 헤더 / 본문 분리
    // --------------------------------------------

    if (i < 2) {

      header.appendChild(tr);

    } else {

      body.appendChild(tr);

    }

  });

}


// ============================================================
// 배경
// ============================================================

function loadBackground() {

  const imageUrl =
    "https://lh3.googleusercontent.com/d/1I6GpLZWd4VHXOngIawz2fcnLwnd9285w";


  document.body.style.backgroundImage =
    `url("${imageUrl}")`;


  document.body.style.backgroundSize =
    "cover";


  document.body.style.backgroundPosition =
    "center";


  document.body.style.backgroundRepeat =
    "no-repeat";

}


// ============================================================
// 연도 저장
// ============================================================

async function saveYear() {

  const year =
    document
      .getElementById("yearInput")
      .value;


  if (!year) return;


  try {

    await apiPost({

      action:
        "updateYear",

      year:
        Number(year)

    });


    await initSheetSelect();


  } catch (error) {

    console.error(error);

    alert(
      "연도 변경 중 오류가 발생했습니다.\n" +
      error.message
    );

  }

}


// ============================================================
// 현재 월 초기화
// ============================================================

async function resetCurrentMonth() {

  const sheetName =
    localStorage.getItem(
      "selectedSheet"
    );


  // 합계 초기화 금지
  if (sheetName === "합계") {

    alert(
      "합계 시트는 초기화할 수 없습니다."
    );

    return;

  }


  const confirmReset =
    confirm(
      `${sheetName}월의 내용을 모두 초기화하시겠습니까?\n\n` +
      `이 작업은 되돌릴 수 없습니다.`
    );


  if (!confirmReset) return;


  try {

    await apiPost({

      action:
        "resetMonth",

      sheet:
        sheetName

    });


    alert(
      `${sheetName}월 내용이 초기화되었습니다.`
    );


    await loadTable();


  } catch (error) {

    console.error(error);

    alert(
      "초기화 중 오류가 발생했습니다.\n" +
      error.message
    );

  }

}


// ============================================================
// 행 수정
// ============================================================

function editRow(index, row) {

  const time =
    prompt(
      "시간",
      row[2] ?? ""
    );


  if (time === null) return;


  const study =
    prompt(
      "연구",
      row[3] ?? ""
    );


  if (study === null) return;


  const memo =
    prompt(
      "비고",
      row[4] ?? ""
    );


  if (memo === null) return;


  const finalData = [

    row[1],

    time || row[2],

    study || row[3],

    memo || row[4]

  ];


  saveRow(
    index,
    finalData
  );

}


// ============================================================
// 행 저장
// ============================================================

async function saveRow(
  rowIndex,
  rowData
) {

  const sheetName =
    localStorage.getItem(
      "selectedSheet"
    );


  try {

    await apiPost({

      action:
        "saveData",

      sheet:
        sheetName,

      rowIndex:
        rowIndex,

      rowData:
        JSON.stringify(rowData)

    });


    await loadTable();


  } catch (error) {

    console.error(error);

    alert(
      "저장 중 오류가 발생했습니다.\n" +
      error.message
    );

  }

}


// ============================================================
// 시작
// ============================================================

window.onload = () => {

  initSheetSelect();

  loadBackground();

};
