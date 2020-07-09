browser.storage.local.get(null).then(a => {
  if (a.showProgress === undefined) { browser.storage.local.set({ showProgress: true }) }
})

let createData = {
  type: "detached_panel",
  url: "progress.html",
  width: 640,
  height: 480
};
let createData2 = {
  type: "detached_panel",
  url: "manual.html",
  width: 640,
  height: 480
};
let createData3 = {
  type: "detached_panel",
  url: "error.html",
  width: 640,
  height: 480
};

var service, file, responseUrl, error;
browser.runtime.onMessage.addListener(listener);

function listener(m) {
  file = m.file; service = m.service; var manual, filename;
  m.manual ? manual = true : manual = false;
  m.filename ? filename = m.filename : filename = false;
  if (m.service === 'onedrive') {
    browser.storage.local.get(null).then(a => { a.onedriveactive ? uploadToOnedrive(m.file, manual, filename) : getOnedriveToken(false, m.file, manual, filename, false) })
  }
  if (m.service === 'dropbox') {
    browser.storage.local.get(null).then(a => { a.dropboxactive ? uploadToDropbox(m.file, manual, filename) : getDropboxToken(false, m.file, manual, filename) })
  }
  if (m.service === 'getODtoken') { getOnedriveToken(true, null, null, null) }
  if (m.service === 'getDBtoken') { getDropboxToken(true) }
}
function getOnedriveToken(inter = false, file, manual, filename) {
  browser.identity.launchWebAuthFlow({ url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=cc84b4cf-1ddb-4c85-9631-51cea7f23545&scope=files.readwrite,user.read&response_type=token&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativclient', interactive: inter }).
    then(
      a => { var token = a.toString().replace(/^https:\/\/login\.microsoftonline\.com\/common\/oauth2\/nativclient#access_token=(.+)&t.+/, '$1'); fetch('https://graph.microsoft.com/v1.0/me', { headers: { 'Authorization': 'Bearer ' + token } }).then(a => { a.json().then(a => { browser.storage.local.set({ onedriveactive: a.userPrincipalName, ["-one-acc-" + a.userPrincipalName]: { token: token } }).then(() => { uploadToOnedrive(file, manual, filename) }) }) }) },
      a => { if (a.toString() === 'Error: Requires user interaction') { getOnedriveToken(true, file, manual, filename) } else console.log(a.toString()) }
    );
}
function uploadToOnedrive(file, manual, filename) {
  var finalFileName;
  filename ? finalFileName = filename : finalFileName = file.split('?')[0].split('/').pop();
  finalFileName === '' ? finalFileName = 'untitled' : finalFileName = finalFileName;
  browser.storage.local.get(null).then(a => {
    var dir = a['-od-dir-' + a.onedriveactive] ? a['-od-dir-' + a.onedriveactive] === '' ? '' : `:/${a['-od-dir-' + a.onedriveactive]}:` : '';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://graph.microsoft.com/v1.0/me/drive/root' + dir + '/children');
    xhr.setRequestHeader('Authorization', 'Bearer ' + a['-one-acc-' + a.onedriveactive].token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Prefer', 'respond-async');
    xhr.send(JSON.stringify({
      "@microsoft.graph.sourceUrl": file,
      "name": finalFileName,
      "file": {}
    }));
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status > 400) {
        if (JSON.parse(xhr.response).error.code == 'InvalidAuthenticationToken') {
          getOnedriveToken(false, file, manual, filename, false)
        }
        else if (JSON.parse(xhr.response).error.code == "itemNotFound") {
          var directories = a['-od-dir-' + a.onedriveactive].split('/');
          testDir(0, directories[0], '');
          function testDir(index, dir, trail) {
            var colon = '';
            if (index > 0) { colon = ':'; trail += `/${directories[index - 1]}` }
            if (index >= directories.length) { uploadToOnedrive(file, manual, filename) }
            else {
              fetch(`https://graph.microsoft.com/v1.0/me/drive/items/root:/${dir}`, { headers: { 'Authorization': 'Bearer ' + a['-one-acc-' + a.onedriveactive].token } }).then(w => {
                w.json().then(e => {
                  if (e.error) { fetch(`https://graph.microsoft.com/v1.0/me/drive/items/root${colon}${trail}${colon}/children`, { method: 'POST', headers: { 'Authorization': 'Bearer ' + a['-one-acc-' + a.onedriveactive].token, 'Content-Type': 'application/json' }, body: JSON.stringify({ "name": `${directories[index]}`, "folder": {}, "@microsoft.graph.conflictBehavior": "fail" }) }).then(p => { ++index; dir += `/${directories[index]}`; testDir(index, dir, trail) }) }
                  else { ++index; dir += `/${directories[index]}`; testDir(index, dir, trail) }
                })
              })
            }
          }
        }
        else { error = xhr.response; browser.windows.create(createData3); }
      }
      else if (xhr.readyState === 4) {
        responseUrl = xhr.getResponseHeader('location'); if (manual) { browser.tabs.update({ url: 'progress.html' }) } else { if (a.showProgress) { browser.windows.create(createData) } }
      }
    }
  })
}
function getDropboxToken(inter = false, file, manual, filename) {
  browser.identity.launchWebAuthFlow({ url: 'https://www.dropbox.com/oauth2/authorize?client_id=b94hb212qtdaj5v&response_type=token&redirect_uri=https://clouduploader/', interactive: inter }).
    then(
      a => { var token = a.toString().replace(/^https:\/\/clouduploader\/#access_token=(.+)&t.+/, '$1'); fetch('https://api.dropboxapi.com/2/users/get_current_account', { headers: { 'Authorization': 'Bearer ' + token }, method: 'POST' }).then(a => { a.json().then(a => { browser.storage.local.set({ dropboxactive: a.email, ["-db-acc-" + a.email]: { token: token } }).then(() => { uploadToDropbox(file, manual, filename) }) }) }) },
      a => { if (a.toString() === 'Error: Requires user interaction') { getDropboxToken(true, file, manual, filename) } else console.log(a.toString()) }
    );
}
function uploadToDropbox(file, manual, filename) {
  var finalFileName;
  filename ? finalFileName = filename : finalFileName = file.split('?')[0].split('/').pop();
  finalFileName === '' ? finalFileName = 'untitled' : finalFileName = finalFileName;
  browser.storage.local.get(null).then(a => {
    var dropboxPath = a['-db-dir-' + a.dropboxactive] ? '/' + a['-db-dir-' + a.dropboxactive] + '/' + finalFileName : '/' + finalFileName;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '    https://api.dropboxapi.com/2/files/save_url');
    xhr.setRequestHeader('Authorization', 'Bearer ' + a['-db-acc-' + a.dropboxactive].token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      "path": dropboxPath,
      "url": file
    }));
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status > 400) {
        error = xhr.response; browser.windows.create(createData3)
      }
      else if (xhr.readyState === 4) {
        responseUrl = JSON.parse(xhr.response).async_job_id; if (manual) { browser.tabs.update({ url: 'progress.html' }) } else {
          if (a.showProgress) { browser.windows.create(createData) }
        }
      }
    }
  })
}
browser.menus.create({
  onclick(info, tab) {
    browser.windows.create(createData2)
  },
  title: 'Manually Upload',
  icons: { '16': 'manual.svg' }

})
browser.menus.create({
  onclick(info, tab) {
    browser.tabs.executeScript(tab.id, {
      code: `var info=browser.menus.getTargetElement(${info.targetElementId});var service = 'dropbox';`
    });
    browser.tabs.executeScript(tab.id, {
      file: 'determineElement.js'
    });
  },
  title: 'Upload to Dropbox',
  icons: { '16': 'dropbox.svg' }

})
browser.menus.create({
  onclick(info, tab) {
    browser.tabs.executeScript(tab.id, {
      code: `var info=browser.menus.getTargetElement(${info.targetElementId});var service = 'onedrive';`
    });
    browser.tabs.executeScript(tab.id, {
      file: 'determineElement.js'
    });
  },
  title: 'Upload to OneDrive',
  icons: { '16': 'onedrive.svg' }

})
browser.menus.create({
  onclick(info, tab) {
    browser.tabs.executeScript(tab.id, {
      code: `var info=browser.menus.getTargetElement(${info.targetElementId});var service = 'alert';`
    });
    browser.tabs.executeScript(tab.id, {
      file: 'determineElement.js'
    });
  },
  title: 'Alert File',
  icons: { '16': 'important.svg' }

})
browser.menus.create({
  onclick(info, tab) {
    browser.runtime.openOptionsPage()
  },
  title: 'Options',
  icons: { '16': 'gear.svg' }

})