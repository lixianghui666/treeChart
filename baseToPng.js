function baseConvertImage(base,type = "png"){
    let data = base.split(",");
    type = type || data[0].match(/:(.*);/)[1]
    data = window.atob(data[1]);
    let buffer = new ArrayBuffer(data.length);
    let bolbData = new Uint8Array(buffer.byteLength);
    for(let i = 0;i < data.length;++i){
        bolbData[i] = data.charCodeAt(i)
    }
    return new Blob([bolbData],{
        type
    });
}

function downloadFile(file,name){
    let url = URL.createObjectURL(file);
    let a = document.createElement("a");
    a.target = "_target"
    a.setAttribute("href",url);
    a.download = 1 + "." + file.type;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
let file = new File(["1234"],"1",{type: "txt"})
downloadFile(file);