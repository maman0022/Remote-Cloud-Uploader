    function clearAccounts(){
        browser.storage.local.clear().then(()=>{document.getElementById('progressYes').checked?document.getElementById('progressYes').click():document.getElementById('progressNo').click()})
        document.getElementById('clear').innerHTML='Accounts Cleared!'
    }
    function setShowProgress(e){
        if(e.currentTarget.id==='progressYes'){browser.storage.local.set({showProgress:true})}
        else browser.storage.local.set({showProgress:false})
    }
    function setOneDriveActive(e){
        browser.storage.local.set({onedriveactive:e.currentTarget.innerHTML})
    }
    function setDropBoxActive(e){
        browser.storage.local.set({dropboxactive:e.currentTarget.innerHTML})
    }
    browser.storage.local.get(null).then(
        a=>{a.showProgress?document.getElementById('progressYes').setAttribute('checked',true):document.getElementById('progressNo').setAttribute('checked',true);
        if(a.onedriveactive){document.getElementById('oneacc').insertAdjacentHTML('afterbegin',`<option class='odacc' selected>${a.onedriveactive}</option>`)}
        var oneDriveAccounts = Object.keys(a).filter(key=>{if(key.includes('-one-acc-')&&!key.includes(a.onedriveactive)){return key}});
        oneDriveAccounts.forEach(key=>{document.getElementById('addODAcc').insertAdjacentHTML('beforebegin',`<option class='odacc'>${key.replace('-one-acc-','')}</option>`)});
        document.querySelectorAll('option.odacc').forEach(option=>{option.onclick=setOneDriveActive})

        if(a.dropboxactive){document.getElementById('dbacc').insertAdjacentHTML('afterbegin',`<option class='dbacc' selected>${a.dropboxactive}</option>`)}
        var dropBoxAccounts = Object.keys(a).filter(key=>{if(key.includes('-db-acc-')&&!key.includes(a.dropboxactive)){return key}});
        dropBoxAccounts.forEach(key=>{document.getElementById('addDBAcc').insertAdjacentHTML('beforebegin',`<option class='dbacc'>${key.replace('-db-acc-','')}</option>`)});
        document.querySelectorAll('option.dbacc').forEach(option=>{option.onclick=setDropBoxActive})
    }
    )
    document.getElementById('clear-btn').onclick=clearAccounts;
    document.getElementById('progressYes').onclick=setShowProgress;
    document.getElementById('progressNo').onclick=setShowProgress;
    document.getElementById('addODAcc').onclick=()=>{browser.runtime.sendMessage({service:'getODtoken'})}
    document.getElementById('addDBAcc').onclick=()=>{browser.runtime.sendMessage({service:'getDBtoken'})}
    