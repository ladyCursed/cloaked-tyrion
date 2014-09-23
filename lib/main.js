const {Ci,Cc} = require("chrome");
// const Cc = Components.classes;
// const Ci = Components.interfaces;

var observerService = Cc["@mozilla.org/observer-service;1"]
    .getService(Ci.nsIObserverService);

observerService.addObserver(httpRequestObserver,
    "http-on-examine-response", false);
	
observerService.removeObserver(httpRequestObserver,
"http-on-examine-response");

var httpRequestObserver =
{
	observe: function(aSubject, aTopic, aData)
	{
	    if (aTopic == "http-on-examine-response") {
	        var newListener = new TracingListener();
	        aSubject.QueryInterface(Ci.nsITraceableChannel);
	        newListener.originalListener = aSubject.setNewListener(newListener);
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

function TracingListener() {
    this.originalListener = null;
}

TracingListener.prototype =
{
    onDataAvailable: function(request, context, inputStream, offset, count) {
        this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
    },

    onStartRequest: function(request, context) {
        this.originalListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode) {
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

