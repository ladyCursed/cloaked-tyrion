const {Ci,Cc,Cr} = require("chrome");

console.log('here a')

// const Cc = Components.classes;
// const Ci = Components.interfaces;

var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

function disp(title, msg){
  console.log(title + ': ')
  console.log(msg)
}
// function TracingListener() {
//     this.originalListener = null;
// }
//
// TracingListener.prototype =
// {
//     onDataAvailable: function(request, context, inputStream, offset, count) {
//         this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
//     },
//
//     onStartRequest: function(request, context) {
//         this.originalListener.onStartRequest(request, context);
//     },
//
//     onStopRequest: function(request, context, statusCode) {
//         this.originalListener.onStopRequest(request, context, statusCode);
//     },
//
//     QueryInterface: function (aIID) {
//         if (aIID.equals(Ci.nsIStreamListener) ||
//             aIID.equals(Ci.nsISupports)) {
//             return this;
//         }
//         throw Cr.NS_NOINTERFACE;
//     }
// }

/* better listener */
 // Helper function for XPCOM instanciation (from Firebug)
function CCIN(cName, ifaceName) {
    return Cc[cName].createInstance(Ci[ifaceName]);
}

// Copy response listener implementation.
function TracingListener() {
    this.originalListener = null;
    this.receivedData = [];   // array for incoming data.
}

TracingListener.prototype =
{
    onDataAvailable: function(request, context, inputStream, offset, count)
    {
        // var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1",
        //         "nsIBinaryInputStream");
        // var storageStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
        // var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1",
        //         "nsIBinaryOutputStream");
        //
        // binaryInputStream.setInputStream(inputStream);
        // storageStream.init(8192, count, null);
        // binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
        //
        // // Copy received data as they come.
        // var data = binaryInputStream.readBytes(count);
        // this.receivedData.push(data);
        //
        // binaryOutputStream.writeBytes(data, count);

        // this.originalListener.onDataAvailable(request, context,
        //     storageStream.newInputStream(0), offset, count);
        /* how about not doing that stuff */
        try {
            this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
        }
        catch(ex){
          console.log('exception was thrown: ')
          disp('TracingListener Exception', ex)
        }

    },

    onStartRequest: function(request, context) {
        this.originalListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode)
    {
        // Get entire response
        var responseSource = this.receivedData.join();
        this.originalListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Cr.NS_NOINTERFACE;
    }
}


console.log('here b');
var myArr = [];
var exitPackage = function(httpChannel){
	this.name = httpChannel.name;
	this.status = httpChannel.responseStatus;
	this.contentType = httpChannel.contentType;
}


var httpRequestObserver =
{
	observe: function(aSubject, aTopic, aData)
	{
	    if (aTopic == "http-on-examine-response") {
  			var httpChannel = aSubject.QueryInterface(Ci.nsIHttpChannel);
  			//console.log(httpChannel.getResponseHeader("Status-URI"))
  			//console.log(httpChannel.getResponseHeader("Content-Type")) // throws error
        console.log(httpChannel)
        try {
          console.log(httpChannel.getResponseHeader("Server"))
        }
        catch(ex){
          console.log('exception was thrown: ')
          disp('getResponseHeader Exception', ex)
        }

  			disp('responseStatus', httpChannel.responseStatus)
  			disp('httpChannel.status',httpChannel.status)
  			disp('httpChannel.URI',httpChannel.URI)
  			disp('contentType',httpChannel.contentType)
  			disp('name', httpChannel.name)
  			disp('referrer', httpChannel.referrer);
  			console.log('-+-+-+-+-+-')

  			myArr.push( new exitPackage(httpChannel) )
  			//disp('data array', myArr)

        try{
	         var newListener = new TracingListener();
	          aSubject.QueryInterface(Ci.nsITraceableChannel);
	           newListener.originalListener = aSubject.setNewListener(newListener);
           }
           catch(ex){
             console.log('MAIN OUTER EXCEPTION')
             disp('the ex msg:', ex)
           }
	    }
	},

   QueryInterface : function (aIID)
   {
       if (aIID.equals(Ci.nsIObserver) ||
           aIID.equals(Ci.nsISupports))
       {
           return this;
       }

       throw Cr.NS_NOINTERFACE;

   }
};

observerService.addObserver(httpRequestObserver,  "http-on-examine-response", false);
//observerService.removeObserver(httpRequestObserver, "http-on-examine-response");

/** communicate with the other side!! */

var self = require("sdk/self");
var tabs = require("sdk/tabs");

var button = require("sdk/ui/button/action").ActionButton({
  id: "style-tab",
  label: "Style Tab",
  icon: "./icon-16.png",
  onClick: function() {
    worker = tabs.activeTab.attach({
      contentScriptFile: self.data.url("my-shared.js")
    });
    worker.port.emit("data", myArr);
  }
});
