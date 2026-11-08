const $ = id => document.getElementById(id);
let generatedValue = "";
let stream = null;
let scanTimer = null;
let detector = null;

function getHistory(){ try{return JSON.parse(localStorage.getItem("barcode-history")||"[]")}catch{return []} }
function saveHistory(value, format, source="Escaneo"){
  if(!value) return;
  const list=getHistory();
  list.unshift({value,format,source,date:new Date().toISOString()});
  localStorage.setItem("barcode-history",JSON.stringify(list.slice(0,100)));
  renderHistory();
}
function renderHistory(){
  const list=getHistory();
  $("historyCount").textContent=list.length;
  const host=$("historyList");
  if(!list.length){host.innerHTML='<div class="empty">Todavía no hay códigos guardados.</div>';return}
  host.innerHTML=list.map((item,i)=>`<div class="history-item"><div><strong></strong><small></small></div><button class="secondary" data-copy="${i}">Copiar</button></div>`).join("");
  [...host.querySelectorAll(".history-item")].forEach((el,i)=>{
    el.querySelector("strong").textContent=list[i].value;
    el.querySelector("small").textContent=`${list[i].format||"ID"} · ${list[i].source} · ${new Date(list[i].date).toLocaleString("es-MX")}`;
    el.querySelector("button").addEventListener("click",()=>copy(list[i].value));
  });
}
function copy(value){navigator.clipboard?.writeText(value).then(()=>{}).catch(()=>{});}
function generate(){
  const value=$("barcodeValue").value.trim(), format=$("format").value;
  if(!value){$("generateMessage").textContent="Escribe un número o identificador.";return}
  if(!window.JsBarcode){$("generateMessage").textContent="No se pudo cargar el generador. Revisa tu conexión a internet.";return}
  try{
    JsBarcode("#barcode",value,{format,displayValue:$("displayValue").value==="true",lineColor:"#111111",background:"#f7f7f5",width:2,height:90,margin:8});
    generatedValue=value;$("barcodePlaceholder").style.display="none";
    $("generateMessage").textContent="Código generado correctamente.";
    ["downloadPng","downloadSvg","copyGenerated"].forEach(id=>$(id).disabled=false);
    saveHistory(value,format,"Generado");
  }catch(e){$("generateMessage").textContent="El valor no es válido para "+format+". Revisa la cantidad de dígitos y caracteres."}
}
$("generateBtn").addEventListener("click",generate);
$("barcodeValue").addEventListener("keydown",e=>{if(e.key==="Enter")generate()});
$("format").addEventListener("change",()=>{if($("barcodeValue").value.trim())generate()});
$("displayValue").addEventListener("change",()=>{if(generatedValue)generate()});
$("copyGenerated").addEventListener("click",()=>copy(generatedValue));
$("downloadSvg").addEventListener("click",()=>{
  const svg=$("barcode").cloneNode(true), data=new XMLSerializer().serializeToString(svg);
  downloadBlob(new Blob([data],{type:"image/svg+xml"}),`codigo-${safeName(generatedValue)}.svg`);
});
$("downloadPng").addEventListener("click",()=>{
  const svg=$("barcode").cloneNode(true), data=new XMLSerializer().serializeToString(svg);
  const url=URL.createObjectURL(new Blob([data],{type:"image/svg+xml"})), img=new Image();
  img.onload=()=>{const c=document.createElement("canvas");c.width=img.width*2;c.height=img.height*2;const ctx=c.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);c.toBlob(blob=>downloadBlob(blob,`codigo-${safeName(generatedValue)}.png`));URL.revokeObjectURL(url)};
  img.src=url;
});
function safeName(s){return s.replace(/[^a-z0-9_-]/gi,"-").slice(0,40)||"barcode"}
function downloadBlob(blob,name){const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab,.panel").forEach(el=>el.classList.remove("active"));
  btn.classList.add("active");$(btn.dataset.tab).classList.add("active");
  if(btn.dataset.tab!=="scan")stopScan();
}));
$("clearHistory").addEventListener("click",()=>{if(confirm("¿Borrar todo el historial de este dispositivo?")){localStorage.removeItem("barcode-history");renderHistory()}});
function showResult(value,format){
  $("scanResult").textContent=value;$("scanFormat").textContent=format||"Formato detectado";
  $("copyScan").disabled=false;copyResult=value;saveHistory(value,format||"Desconocido","Escaneado");
  $("scanMessage").textContent="¡Código detectado correctamente!";
}
let copyResult="";
$("copyScan").addEventListener("click",()=>copy(copyResult));
$("manualAdd").addEventListener("click",()=>{
  const v=$("manualValue").value.trim();if(!v){$("scanMessage").textContent="Escribe un ID primero.";return}
  showResult(v,"Entrada manual");$("manualValue").value="";
});
$("manualValue").addEventListener("keydown",e=>{if(e.key==="Enter")$("manualAdd").click()});
async function startScan(){
  if(!("BarcodeDetector" in window)){
    $("scanMessage").textContent="Tu navegador no incluye BarcodeDetector. Prueba Google Chrome actualizado o introduce el ID manualmente.";
    return;
  }
  try{
    const supported=await BarcodeDetector.getSupportedFormats();
    const formats=["code_128","code_39","ean_13","ean_8","upc_a","upc_e","itf","qr_code"].filter(f=>supported.includes(f));
    detector=new BarcodeDetector({formats});
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
    $("video").srcObject=stream;await $("video").play();
    $("video").style.display="block";$("cameraPlaceholder").style.display="none";$("scanFrame").style.display="block";
    $("startScan").disabled=true;$("stopScan").disabled=false;$("scanMessage").textContent="Buscando códigos… Mantén el código dentro del recuadro.";
    scanTimer=setInterval(async()=>{
      if(!$("video").videoWidth)return;
      try{const codes=await detector.detect($("video"));if(codes.length){const c=codes[0];showResult(c.rawValue,c.format.toUpperCase());stopScan()}}catch(e){}
    },350);
  }catch(e){$("scanMessage").textContent=e.name==="NotAllowedError"?"No se concedió permiso para usar la cámara.": "No se pudo iniciar la cámara. Comprueba que esté disponible y que la página use HTTPS o localhost."}
}
function stopScan(){
  if(scanTimer){clearInterval(scanTimer);scanTimer=null}
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
  $("video").srcObject=null;$("video").style.display="none";$("cameraPlaceholder").style.display="flex";$("scanFrame").style.display="none";
  $("startScan").disabled=false;$("stopScan").disabled=true;
}
$("startScan").addEventListener("click",startScan);$("stopScan").addEventListener("click",stopScan);
window.addEventListener("beforeunload",stopScan);
renderHistory();
