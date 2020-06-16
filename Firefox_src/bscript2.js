browser.storage.local.set({showProgress:true})

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
var service,file,responseUrl;
browser.runtime.onMessage.addListener(listener);

function listener(m){
  file = m.file;service=m.service;var manual, filename;
  m.manual?manual=true:manual=false;
  m.filename?filename=m.filename:filename=false;
  if(m.service==='onedrive'){
    browser.storage.local.get(null).then(a=>{a.onedriveactive?uploadToOnedrive(m.file,manual,filename):getOnedriveToken(false,m.file,manual,filename)})
  }
  if(m.service==='dropbox'){
    browser.storage.local.get(null).then(a=>{a.dropboxactive?uploadToDropbox(m.file,manual,filename):getDropboxToken(false,m.file,manual,filename)})
  }
  if(m.service==='getODtoken'){getOnedriveToken(true)}
  if(m.service==='getDBtoken'){getDropboxToken(true)}
}

function getOnedriveToken(inter=false,file,manual,filename){
  browser.identity.launchWebAuthFlow({url:'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=f9059a99-0d4d-4753-85ea-a97c89a66f56&scope=files.readwrite,user.read&response_type=token&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient',interactive:inter}).
  then(
    a=>{var token=a.toString().replace(/^https:\/\/login\.microsoftonline\.com\/common\/oauth2\/nativeclient#access_token=(.+)&t.+/,'$1');fetch('https://graph.microsoft.com/v1.0/me',{headers:{'Authorization':'Bearer '+token}}).then(a=>{a.json().then(a=>{browser.storage.local.set({onedriveactive:a.userPrincipalName,["-one-acc-"+a.userPrincipalName]:{token:token}}).then(()=>{uploadToOnedrive(file,manual,filename)})})})},
    a=>{if(a.toString()==='Error: Requires user interaction'){getOnedriveToken(true,file,manual,filename)}else console.log(a.toString())}
      );
}

function uploadToOnedrive(file,manual,filename){
  var finalFileName;
  filename?finalFileName=filename:finalFileName=file.split('?')[0].split('/').pop();
  finalFileName===''?finalFileName='untitled':finalFileName=finalFileName;
  browser.storage.local.get(null).then(a=>
{  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://graph.microsoft.com/v1.0/me/drive/root/children');
  xhr.setRequestHeader('Authorization', 'Bearer '+a['-one-acc-'+a.onedriveactive].token);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Prefer', 'respond-async');
  xhr.send(JSON.stringify({"@microsoft.graph.sourceUrl":file,
                            "name": finalFileName,
                            "file": {}
                           }));
  xhr.onreadystatechange =()=>{if(xhr.readyState===4&&xhr.status>400){
                                if(JSON.parse(xhr.response).error.code=='InvalidAuthenticationToken'){
                                  getOnedriveToken(false,file)}
                               else{console.log(xhr.response)}  
                               }
                               else if(xhr.readyState===4){responseUrl=xhr.getResponseHeader('location');if(manual){browser.tabs.update({url:'progress.html'})}else{if(a.showProgress){browser.windows.create(createData)}}
                            }
                              }})
}

function getDropboxToken(inter=false,file,manual,filename){
  browser.identity.launchWebAuthFlow({url:'https://www.dropbox.com/oauth2/authorize?client_id=9tmneeyb9u569k8&response_type=token&redirect_uri=https://clouduploader/',interactive:inter}).
  then(
    a=>{var token=a.toString().replace(/^https:\/\/clouduploader\/#access_token=(.+)&t.+/,'$1');fetch('https://api.dropboxapi.com/2/users/get_current_account',{headers:{'Authorization':'Bearer '+token},method:'POST'}).then(a=>{a.json().then(a=>{browser.storage.local.set({dropboxactive:a.email,["-db-acc-"+a.email]:{token:token}}).then(()=>{uploadToDropbox(file,manual,filename)})})})},
    a=>{if(a.toString()==='Error: Requires user interaction'){getDropboxToken(true,file,manual,filename)}else console.log(a.toString())}
      );
}

function uploadToDropbox(file,manual,filename){
  var finalFileName;
  filename?finalFileName=filename:finalFileName=file.split('?')[0].split('/').pop();
  finalFileName===''?finalFileName='untitled':finalFileName=finalFileName;
  browser.storage.local.get(null).then(a=>{
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '    https://api.dropboxapi.com/2/files/save_url');
  xhr.setRequestHeader('Authorization', 'Bearer '+a['-db-acc-'+a.dropboxactive].token);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({"path": '/'+finalFileName,
                            "url": file
                           }));
  xhr.onreadystatechange =()=>{if(xhr.readyState===4&&xhr.status>400){
                                console.log(xhr.response)
                               }
                               else if(xhr.readyState===4){responseUrl=JSON.parse(xhr.response).async_job_id;if(manual){browser.tabs.update({url:'progress.html'})}else{
                                if(a.showProgress){browser.windows.create(createData)}}
                            }
                              }
                            })
}

browser.menus.create({
    onclick(info, tab) {
       browser.tabs.executeScript(tab.id, {
          code: `var info=browser.menus.getTargetElement(${info.targetElementId});var service = 'onedrive';`
        });
        browser.tabs.executeScript(tab.id, {
          file: 'determineElement.js'
        });
      },
      title:'Upload to OneDrive',
      icons:{'16':'onedrive.svg'}

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
      title:'Upload to Dropbox',
      icons:{'16':'dropbox.svg'}

})
browser.menus.create({
  onclick(info, tab) {
    browser.windows.create(createData2)
  },
    title:'Manually Upload',
    icons:{'16':'manual.svg'}

})