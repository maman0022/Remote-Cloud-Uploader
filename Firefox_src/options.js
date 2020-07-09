function clearAccounts() {
    browser.storage.local.clear().then(() => { document.getElementById('progressYes').checked ? document.getElementById('progressYes').click() : document.getElementById('progressNo').click(); })
    browser.tabs.reload()
}
function setShowProgress(e) {
    if (e.currentTarget.id === 'progressYes') { browser.storage.local.set({ showProgress: true }) }
    else browser.storage.local.set({ showProgress: false })
}
function setOneDriveDirectory(e) {
    browser.storage.local.set({ ['-od-dir-' + document.getElementById('oneacc').value]: this.value })
}
function setDropBoxDirectory(e) {
    browser.storage.local.set({ ['-db-dir-' + document.getElementById('dbacc').value]: this.value })
}
function setOneDriveActive(e) {
    browser.storage.local.set({ onedriveactive: e.currentTarget.innerHTML });
    browser.storage.local.get(null).then(a => {
        document.getElementById('oddir').value = a['-od-dir-' + this.innerHTML] ? a['-od-dir-' + this.innerHTML] : ''
    })
}
function setDropBoxActive(e) {
    browser.storage.local.set({ dropboxactive: e.currentTarget.innerHTML });
    browser.storage.local.get(null).then(a => {
        document.getElementById('dbdir').value = a['-db-dir-' + this.innerHTML] ? a['-db-dir-' + this.innerHTML] : ''
    })
}
browser.storage.local.get(null).then(
    a => {
        a.showProgress ? document.getElementById('progressYes').setAttribute('checked', true) : document.getElementById('progressNo').setAttribute('checked', true);
        if (a['-od-dir-' + a.onedriveactive]) { document.getElementById('oddir').value = a['-od-dir-' + a.onedriveactive] }
        if (a['-db-dir-' + a.dropboxactive]) { document.getElementById('dbdir').value = a['-db-dir-' + a.dropboxactive] }

        if (a.onedriveactive) { document.getElementById('oneacc').insertAdjacentHTML('afterbegin', `<option class='odacc' selected>${a.onedriveactive}</option>`) }
        var oneDriveAccounts = Object.keys(a).filter(key => { if (key.includes('-one-acc-') && !key.includes(a.onedriveactive)) { return key } });
        oneDriveAccounts.forEach(key => { document.getElementById('addODAcc').insertAdjacentHTML('beforebegin', `<option class='odacc'>${key.replace('-one-acc-', '')}</option>`) });
        document.querySelectorAll('option.odacc').forEach(option => { option.onclick = setOneDriveActive })

        if (a.dropboxactive) { document.getElementById('dbacc').insertAdjacentHTML('afterbegin', `<option class='dbacc' selected>${a.dropboxactive}</option>`) }
        var dropBoxAccounts = Object.keys(a).filter(key => { if (key.includes('-db-acc-') && !key.includes(a.dropboxactive)) { return key } });
        dropBoxAccounts.forEach(key => { document.getElementById('addDBAcc').insertAdjacentHTML('beforebegin', `<option class='dbacc'>${key.replace('-db-acc-', '')}</option>`) });
        document.querySelectorAll('option.dbacc').forEach(option => { option.onclick = setDropBoxActive })
    }
)
document.getElementById('clear-btn').onclick = clearAccounts;
document.getElementById('progressYes').onclick = setShowProgress;
document.getElementById('progressNo').onclick = setShowProgress;
document.getElementById('oddir').oninput = setOneDriveDirectory;
document.getElementById('dbdir').oninput = setDropBoxDirectory;
document.getElementById('addODAcc').onclick = () => { browser.runtime.sendMessage({ service: 'getODtoken' }) }
document.getElementById('addDBAcc').onclick = () => { browser.runtime.sendMessage({ service: 'getDBtoken' }) }