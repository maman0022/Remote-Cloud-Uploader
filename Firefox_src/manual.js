document.getElementById('filelink').oninput=document.getElementById('urlname').onclick=getNameFromFile;
document.getElementById('uploadbtn').onclick=upload;
function sendForUpload(s){
  if(document.getElementById('filename').value===''){
    alert('File name cannot be empty!')
    return
  }
  var extension=document.getElementById('fileext').value===''?'':'.'+document.getElementById('fileext').value;
  browser.runtime.sendMessage({file:document.getElementById('filelink').value,service:s,manual:true,filename:document.getElementById('filename').value+extension})
}
function getNameFromFile(){
  if(document.getElementById('urlname').checked){
    var fileLink = document.getElementById('filelink').value.split('?')[0].split('/').pop();
    document.getElementById('filename').value = fileLink.split('.')[0];
    document.getElementById('filename').style.width = document.getElementById('filename').value.length + 'ch'
    if(fileLink.split('.')[1]){document.getElementById('fileext').value = fileLink.split('.')[1]};
    document.getElementById('fileext').style.width = document.getElementById('fileext').value.length + 'ch'
  }
  else{
    document.getElementById('filename').value = document.getElementById('fileext').value = '';
    document.getElementById('filename').style.width = document.getElementById('filename').value.length + 'ch'
  }
}
function upload(){
  if(document.getElementById('filelink').value===''){
    alert('No file provided!')
  }
  else{
    document.getElementById('dropboxradio').checked?sendForUpload('dropbox'):document.getElementById('onedriveradio').checked?sendForUpload('onedrive'):alert('No drive selected!')
  }
}