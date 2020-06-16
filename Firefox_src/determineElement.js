var finalLink;
function testDiv(element,runAgain=0){
  if(runAgain>1){alert('No file link found');return}
  if(element.querySelector('video>source')){
    return element.querySelector('video>source').src
  }
  else if(element.querySelector('video')){
    return element.querySelector('video').src
  }
  else if(element.querySelector('img')){
    return element.querySelector('img').src
  }
  else if(element.querySelector('a')){
    return element.querySelector('a').href
  }
  else{testDiv(element.parentNode,runAgain++)}
}

function sendForUpload(){
var name;
if(!finalLink){
  alert('No file link found');return
}
if(finalLink.split('?')[0].split('/').pop()===''){
  name=prompt('Unable to detect filename\nPlease provide a name for the file','example.jpg');
  browser.runtime.sendMessage({file:finalLink,service:service,filename:name});
  return
}
browser.runtime.sendMessage({file:finalLink,service:service})
}

(function(){
if(info.tagName==='VIDEO'&&info.firstElementChild&&info.firstElementChild.tagName==='SOURCE'){
  finalLink = info.firstElementChild.src
  sendForUpload()
}
else if(info.tagName==='VIDEO'||info.tagName==='IMG'){
  finalLink = info.src
  sendForUpload()
}
else if(info.tagName==='A'){
  finalLink = info.href
  sendForUpload()
}
else {
  finalLink = testDiv(info.parentNode)
  sendForUpload()
}
})()
