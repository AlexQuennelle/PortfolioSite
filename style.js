function accessiFrameContent() {
  let iframe = document.getElementById("frame");
  let innerDoc = iframe.contentDocument || iframe.contentWindow.document;
  let canvas = innerDoc.getElementById("canvas");
  if (canvas == undefined) {
    canvas = innerDoc.querySelector("body");
  }
  iframe.width = canvas.scrollWidth;
  iframe.height = canvas.scrollHeight;
}

function openFirstTab(sectionName) {
  let tabcontent;
  let tablinks;

  tabcontent = document.getElementsByClassName("tabcontent " + sectionName);
  tabcontent[0].style.display = "block";

  tablinks = document.getElementsByClassName("tablinks " + sectionName);
  tablinks[0].className += " active";
}
function openTab(event, tabName, sectionName) {
  let tabcontent;
  let tablinks;

  tabcontent = document.getElementsByClassName("tabcontent " + sectionName);
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks " + sectionName);
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";
}

function fetchCode(fileLocation, fileName) {
  fetch(fileLocation + fileName)
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      const codeBlock = document.getElementById(fileName);
      codeBlock.textContent = data;
      if (codeBlock.classList.length > 0) {
        codeBlock.classList.add(codeBlock.parentElement.classList[0]);
      }
      hljs.highlightElement(codeBlock);
    });
}

function isMobile() {
  const regex =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
}

function mobileOverride(path) {
  if (isMobile()) {
    doc = document.head;
    link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = path + "style-mobile.css";
    doc.appendChild(link);
  }
}
