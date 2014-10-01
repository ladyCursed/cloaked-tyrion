// "self" is a global object in content scripts
// Listen for a "drawBorder"
self.port.on("data", function(info) {
  console.log(info);
  console.log(info[0])
  var color = 'green';
  document.body.style.border = "5px solid " + color;
  for(var row in info){
	  console.log(row)
	  var dispText = displayStr(info[row]);
	  var p = document.createElement("p");
	  p.setAttribute('class','dataLog')
	  p.appendChild( document.createTextNode (dispText) )
	  document.body.appendChild(p)
  }
  
});

function displayStr(data){
	//console.log(data)
	//console.log(data.name)
	//console.log(data.status)
	var outStr = '';
	
	var name = typeof(data.name) !== undefined ? data.name : 'name not set';
	var status = typeof(data.status) !== undefined ? data.status :'status code not set';
	var contentType = typeof(data.contentType) !== undefined ? data.contentType : 'content type not set';
	
	outStr = "Uri: "+name+" Status: "+status+" Content Type: "+contentType;
	return outStr;
}