function onedriveProgress(url) {
  browser.storage.local.get(null).then(q => { document.getElementById('acc').innerHTML = document.getElementById('acc').innerHTML + ` - ${q.onedriveactive}` });
  function status() {
    fetch(url).then(
      a => {
        a.json().then(
          b => {
            document.getElementById('progress').innerHTML = 'Status - ' + b.status + '<br>Percent Complete - ' + b.percentageComplete; if (b.status === 'inProgress' || b.status === 'notStarted') { status() } else if (b.status === 'completed') {
              browser.storage.local.get(null).then(q => {
                fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${b.resourceId}`, { headers: { 'Authorization': 'Bearer ' + q['-one-acc-' + q.onedriveactive].token } }).then(res => { res.json().then(j => { document.getElementById('filelink').innerHTML = j['@microsoft.graph.downloadUrl']; document.getElementById('filelink').href = j['@microsoft.graph.downloadUrl']; }) })
              })
            }
          }
        )
      }
    )
  }
  status()
}
function dropboxProgress(job_id, path) {
  browser.storage.local.get(null).then(
    a => {
      document.getElementById('acc').innerHTML = document.getElementById('acc').innerHTML + ` - ${a.dropboxactive}`
      function status() {
        fetch('https://api.dropboxapi.com/2/files/save_url/check_job_status', { method: 'POST', headers: { 'Authorization': 'Bearer ' + a['-db-acc-' + a.dropboxactive].token, 'Content-Type': "application/json" }, body: JSON.stringify({ "async_job_id": job_id }) }).then(
          res => {
            res.json().then(
              b => {
                if (b.error) {
                  document.getElementById('progress').innerHTML = 'Error: ' + b.error_summary
                }
                else if (b[".tag"] === "in_progress") {
                  document.getElementById('progress').innerHTML = 'In Progress'; status()
                }
                else if (b[".tag"] === "complete") {
                  document.getElementById('progress').innerHTML = 'Complete'
                  fetch('https://api.dropboxapi.com/2/files/get_temporary_link', { method: 'POST', headers: { 'Authorization': 'Bearer ' + a['-db-acc-' + a.dropboxactive].token, 'Content-Type': "application/json" }, body: JSON.stringify({ "path": path }) }).then(res => { res.json().then(j => { document.getElementById('filelink').innerHTML = j.link; document.getElementById('filelink').href = j.link; }) })
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
  then(a => { document.getElementById('filelink').innerHTML = a.file; document.getElementById('filelink').href = a.file; document.getElementById('acc').innerHTML = a.service.toUpperCase(); a.service === 'onedrive' ? onedriveProgress(a.responseUrl) : dropboxProgress(a.responseUrl, a.dropboxPath) })
