browser.storage.local.get(null).then(
  a => {
    if (a.onedriveactive) { document.getElementById('oneacc').insertAdjacentHTML('afterbegin', `<option class='odacc' selected>${a.onedriveactive}</option>`) }
    var oneDriveAccounts = Object.keys(a).filter(key => { if (key.includes('-one-acc-') && !key.includes(a.onedriveactive)) { return key } });
    oneDriveAccounts.forEach(key => { document.getElementById('addODAcc').insertAdjacentHTML('beforebegin', `<option class='odacc'>${key.replace('-one-acc-', '')}</option>`) });
    document.querySelectorAll('option.odacc').forEach(option => { option.onclick = setOneDriveActive })

    if (a.dropboxactive) { document.getElementById('dbacc').insertAdjacentHTML('afterbegin', `<option class='dbacc' selected>${a.dropboxactive}</option>`) }
    var dropBoxAccounts = Object.keys(a).filter(key => { if (key.includes('-db-acc-') && !key.includes(a.dropboxactive)) { return key } });
    dropBoxAccounts.forEach(key => { document.getElementById('addDBAcc').insertAdjacentHTML('beforebegin', `<option class='dbacc'>${key.replace('-db-acc-', '')}</option>`) });
    document.querySelectorAll('option.dbacc').forEach(option => { option.onclick = setDropBoxActive })

    if (a['-od-dir-' + a.onedriveactive]) { document.getElementById('oddir').value = a['-od-dir-' + a.onedriveactive] }
    if (a['-db-dir-' + a.dropboxactive]) { document.getElementById('dbdir').value = a['-db-dir-' + a.dropboxactive] }
  })
function setOneDriveActive(e) {
  browser.storage.local.set({ onedriveactive: e.currentTarget.innerHTML }).then(directoryLoad('oddir', '-od-dir-', 'onedriveactive'))
}
function setDropBoxActive(e) {
  browser.storage.local.set({ dropboxactive: e.currentTarget.innerHTML }).then(directoryLoad('dbdir', '-db-dir-', 'dropboxactive'))
}
function sendForUpload(s) {
  if (multiSelected) {
    if ((document.getElementById('iteratorFilename').value === '' || document.getElementById('iteratorStartNum').value === '' || document.getElementById('iteratorExt').value === '') && !document.getElementById('iteratorUrl').checked) {
      alert('File name cannot be empty!')
      return
    }
    if (document.getElementById('iteratorUrl').checked) {
      document.getElementById('filelink').value.split(/\n/g).forEach(url => {
        browser.runtime.sendMessage({ file: url, service: s, manual: true, filename: url.split('?')[0].split('/').pop() })
      })
    }
    else {
      let name = document.getElementById('iteratorFilename').value;
      let startNumber = parseInt(document.getElementById('iteratorStartNum').value);
      let extension = document.getElementById('iteratorExt').value === '' ? '' : '.' + document.getElementById('iteratorExt').value;
      document.getElementById('filelink').value.split(/\n/g).forEach((url, index) => {
        browser.runtime.sendMessage({ file: url, service: s, manual: true, filename: name + (startNumber + index) + extension })
      })
    }
  }
  else {
    if (document.getElementById('filename').value === '') {
      alert('File name cannot be empty!')
      return
    }
    var extension = document.getElementById('fileext').value === '' ? '' : '.' + document.getElementById('fileext').value;
    browser.runtime.sendMessage({ file: document.getElementById('filelink').value, service: s, manual: true, filename: document.getElementById('filename').value + extension })
  }
}
function getNameFromFile() {
  if (document.getElementById('urlname').checked) {
    var fileLink = document.getElementById('filelink').value.split('?')[0].split('/').pop();
    document.getElementById('filename').value = fileLink.split('.')[0];
    document.getElementById('filename').style.width = document.getElementById('filename').value.length + 'ch'
    if (fileLink.split('.')[1]) { document.getElementById('fileext').value = fileLink.split('.')[1] };
    document.getElementById('fileext').style.width = document.getElementById('fileext').value.length + 'ch'
  }
  else {
    document.getElementById('filename').value = document.getElementById('fileext').value = '';
    document.getElementById('filename').style.width = document.getElementById('filename').value.length + 'ch'
  }
}
function upload() {
  if (document.getElementById('filelink').value === '') {
    alert('No file provided!')
  }
  else {
    document.getElementById('dropboxradio').checked ? sendForUpload('dropbox') : document.getElementById('onedriveradio').checked ? sendForUpload('onedrive') : alert('No drive selected!')
  }
}
function directoryDisplay() {
  if (this.id === 'onedriveradio') {
    document.getElementById('odwrap').style.display = 'inline'
    document.getElementById('dbwrap').style.display = 'none'
  }
  if (this.id === 'dropboxradio') {
    document.getElementById('dbwrap').style.display = 'inline'
    document.getElementById('odwrap').style.display = 'none'
  }
}
function directoryLoad(q, w, e) {
  browser.storage.local.get(null).then(a => {
    document.getElementById(q).value = a[w + a[e]] ? a[w + a[e]] : '';
  })
}
function setOneDriveDirectory(e) {
  browser.storage.local.set({ ['-od-dir-' + document.getElementById('oneacc').value]: this.value })
}
function setDropBoxDirectory(e) {
  browser.storage.local.set({ ['-db-dir-' + document.getElementById('dbacc').value]: this.value })
}
var multiSelected = false;
document.getElementById('oddir').oninput = setOneDriveDirectory;
document.getElementById('dbdir').oninput = setDropBoxDirectory;
document.getElementById('onedriveradio').addEventListener('click', directoryDisplay);
document.getElementById('dropboxradio').addEventListener('click', directoryDisplay);
document.getElementById('filelink').oninput = document.getElementById('urlname').onclick = getNameFromFile;
document.getElementById('uploadbtn').onclick = upload;
document.getElementById('filename').oninput = e => { e.currentTarget.style.width = e.currentTarget.value.length + 'ch' };
document.getElementById('fileext').oninput = e => { e.currentTarget.style.width = e.currentTarget.value.length + 'ch' };
document.getElementById('multi').onclick = e => { document.getElementById('fnamewrap').style.display = 'none'; document.getElementById('fmultiwrap').style.display = 'block'; document.getElementById('filelink').style.maxHeight = '85vh'; document.getElementById('filelink').style.height = '45vh'; document.getElementById('filelink').placeholder='Paste URLs here, each one on a new line'; multiSelected = true };
document.getElementById('single').onclick = e => { document.getElementById('fmultiwrap').style.display = 'none'; document.getElementById('fnamewrap').style.display = 'block'; document.getElementById('filelink').style.maxHeight = '20vh'; document.getElementById('filelink').style.removeProperty('height'); document.getElementById('filelink').placeholder='Paste URL here'; multiSelected = false };
document.getElementById('addODAcc').onclick = () => { browser.runtime.sendMessage({ service: 'getODtoken' }) }
document.getElementById('addDBAcc').onclick = () => { browser.runtime.sendMessage({ service: 'getDBtoken' }) }