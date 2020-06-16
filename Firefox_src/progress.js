function onedriveProgress(url){
  browser.storage.local.get(null).then(a=>{document.getElementById('acc').innerHTML=document.getElementById('acc').innerHTML+` - ${a.onedriveactive}`});
    function status(){
      fetch(url).then(
        a=>{
          a.json().then(
            b=>{document.getElementById('progress').innerHTML='Status - '+b.status+'<br>Percent Complete - '+b.percentageComplete;if(b.status==='inProgress'||b.status==='notStarted'){status()}}
          )
        }
      )
    }
    status()
  }
  function dropboxProgress(job_id){
    browser.storage.local.get(null).then(
      a=>{
        document.getElementById('acc').innerHTML=document.getElementById('acc').innerHTML+` - ${a.dropboxactive}`
        function status(){
          fetch('https://api.dropboxapi.com/2/files/save_url/check_job_status',{method:'POST',headers:{'Authorization': 'Bearer '+a['-db-acc-'+a.dropboxactive].token,'Content-Type': "application/json"},body:JSON.stringify({"async_job_id": job_id})}).then(
            res=>{
             res.json().then(
               a=>{
                 if(a.error){
                   document.getElementById('progress').innerHTML='Error: '+a.error_summary
                 }
                 else if(a[".tag"]==="in_progress"){
                   document.getElementById('progress').innerHTML='In Progress';status()
                 }
                 else if(a[".tag"]==="complete"){
                   document.getElementById('progress').innerHTML='Complete'
                 }
               }
               )
            }
          )
        }
        status()
      }
    )
  }
  browser.runtime.getBackgroundPage().
   then(a=>{document.getElementById('filelink').innerHTML=a.file;document.getElementById('filelink').href=a.file;document.getElementById('acc').innerHTML=a.service.toUpperCase();a.service==='onedrive'?onedriveProgress(a.responseUrl):dropboxProgress(a.responseUrl)})
