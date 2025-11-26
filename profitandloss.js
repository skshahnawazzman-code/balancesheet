const editLayer = document.getElementById("editLayer");
const addTextBtn = document.getElementById("addText");
const saveBtn = document.getElementById("saveBtn");
const saveAsBtn = document.getElementById("saveAsBtn");
const loadJson = document.getElementById("loadJson");
const page = document.getElementById("page");
const pageName1 = document.getElementById("profitandlossData");


let selected = null;
let offset = { x: 0, y: 0 };

function makeDraggable(el) {
  el.addEventListener("mousedown", (e) => {
    selected = el;
    const rect = el.getBoundingClientRect();
    offset.x = e.clientX - rect.left;
    offset.y = e.clientY - rect.top;
  });

  document.addEventListener("mousemove", (e) => {
    if (selected) {
      const rect = editLayer.getBoundingClientRect();
      let newTop = e.clientY - rect.top - offset.y;
      let newLeft = e.clientX - rect.left - offset.x;

      newTop = Math.max(0, Math.min(newTop, rect.height - selected.offsetHeight));
      newLeft = Math.max(0, Math.min(newLeft, rect.width - selected.offsetWidth));

      selected.style.top = newTop + "px";
      selected.style.left = newLeft + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    if (selected) {
      saveToLocal(); // ⭐ DRAG END PAR POSITION SAVE
    }
    selected = null;
  });
}

function createTextBox(html, top, left) {
  const box = document.createElement("div");
  box.className = "text-box";
  box.contentEditable = "true";
  box.innerHTML = html || "Type here...";

  box.style.position = "absolute";
  box.style.top = top || "50px";
  box.style.left = left || "50px";

  box.addEventListener("input", saveToLocal);

  box.addEventListener("dblclick", () => {
    box.remove();
    saveToLocal();
  });

  return box;
}

addTextBtn.addEventListener("click", () => {
  const box = createTextBox("Type here...", "50px", "50px");
  editLayer.appendChild(box);
  makeDraggable(box);
  box.focus();
  saveToLocal();
});

function getPageData() {
  const boxes = document.querySelectorAll(".text-box");
  const data = [];
  boxes.forEach((box) => {
    data.push({
      html: box.innerHTML,
      top: box.style.top,
      left: box.style.left
    });
  });
  return data;
}

function saveToLocal() {
  const data = getPageData();
  localStorage.setItem("pageName1", JSON.stringify(data));
}

function loadFromLocal() {
  const savedData = localStorage.getItem("pageName1");
  if (savedData) {
    const items = JSON.parse(savedData);
    editLayer.innerHTML = "";
    items.forEach((item) => {
      const box = createTextBox(item.html, item.top, item.left);
      editLayer.appendChild(box);
      makeDraggable(box);
    });
  }
}


saveBtn.addEventListener("click", async () => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: "page_data.json",
      types: [{ description: "JSON File", accept: { "application/json": [".json"] } }]
    });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(getPageData(), null, 2));
    await writable.close();
    alert("JSON saved successfully!");
  } catch (err) { console.error(err); }
});

saveAsBtn.addEventListener("click", async () => {
  try {
    const pdfBlob = await html2pdf()
      .set({
        margin: 0,
        filename: "page.pdf",
        html2canvas: {
          scale: window.devicePixelRatio * 10,
          dpi: 300,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: false
        }
      })
      .from(page)
      .outputPdf("blob");

    const url = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(url);
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
    };

  } catch (err) {
    console.error(err);
  }
});

loadJson.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const items = JSON.parse(reader.result);
    editLayer.innerHTML = "";
    items.forEach((item) => {
      const box = createTextBox(item.html, item.top, item.left);
      editLayer.appendChild(box);
      makeDraggable(box);
    });
    saveToLocal();
  };
  reader.readAsText(file);
});

window.addEventListener("DOMContentLoaded", loadFromLocal);

document.getElementById("balancesheet").addEventListener("click", function () {

      window.location.href = "balancesheet_page.html";
    })
document.getElementById("computation").addEventListener("click", function () {

      window.location.href = "computation.html";

    })
