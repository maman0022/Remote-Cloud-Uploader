browser.runtime.getBackgroundPage().
   then(a => { document.getElementById('filelink').innerHTML = a.file; document.getElementById('filelink').href = a.file; document.getElementById('acc').innerHTML = a.service.toUpperCase(); document.getElementById('error').innerHTML = a.error.replace(/,/g, '\n').replace(/"/g, '').replace(/{/g, '').replace(/}/g, '').replace(/^(.+):/gm, '<strong style="color: lightsalmon;">$1</strong> -') })