
var TELEMETRY_TIMEOUT=100000


function TelemetryStream(serverurl,resolution, formateview, timeview) {
  this.crits = new Array();
  this.monitors = new Array();
  this.epochmonitors = new Array();
  this.resoultion = resolution;
  
  
  this.serverurl=serverurl;
  this.connection = false;
  this.connection2 = false;
  this.iframediv  = false;

  this.time = 0.0;
  this.timeoutid = 0;
  this.toggle = false;

  //display elements:
  this.formateview=formateview;
  this.timeview=timeview;

  //this method will start a connection (a seaparate thread
  //for handling telemetry via an invisible iframe element --
  //standard way for doing Comet
  this.getConnectionNormal = function(){
    connection = document.createElement('div');
    connection.setAttribute('id','telemetryStream_iframe');
    with (connection.style) {
      left       = top   = "1px";
      height     = width = "1px";
      visibility = "hidden";
      monitor    = 'none';
      display = 'none';
    };
    this.iframediv = document.createElement('iframe');
    this.iframediv.src=this.serverurl;
    connection.appendChild(this.iframediv);
    document.body.appendChild(connection);
    return connection;
  };


  this.getConnectionIE = function(){
      // For IE browsers
    connection = new ActiveXObject("htmlfile");

    connection.open();
    connection.write("<html>");
    connection.write("<script>document.domain = '"+document.domain+"'");
    connection.write("</html>");
    connection.close();

    this.iframediv = connection.createElement("div");
    connection.appendChild(this.iframediv);
    //    connection.parentWindow.this = this;

    this.iframediv.innerHTML = "<iframe id='this_iframe' src='"+this.serverurl+"'></iframe>";  
    return connection;
  };

  this.getConnectionKHTML = function(){
    connection = false;
    // for KHTML browsers
    connection = document.createElement('iframe');
    connection.setAttribute('id',     'telemetryStream_iframe');
    connection.setAttribute('src',  this.serverurl);
    with (connection.style) {
	position   = "absolute";
	left       = top   = "-100px";
	height     = width = "1px";
	visibility = "hidden";
      }
      document.body.appendChild(connection);
      return connection;
  };


  this.initialize = function() {
    //    this.formatview = document.getElementById('format_field');
    //    this.timeview   = document.getElementById('time_field');
    var connection = false;
    if (navigator.appVersion.indexOf("MSIE") != -1) {
      connection=this.getConnectionIE();      
    } else if (navigator.appVersion.indexOf("KHTML") != -1) {      
      connection=this.getConnectionKHTML();
    } else {
      connection=this.getConnectionNormal();     
    }
    //we need to toggle between two connections in order
    //to ensure proper shtudown/restart of telemetry stream if necessary
    if (this.toggle)
      {
	this.connection=connection;
	this.connection2=false;
      }
    else
      {
	this.connection2=connection;
	this.connection=false;
      }
    this.toggle=!this.toggle;
  };
  
  this.restart = function(){
    this.initialize();
  };

  this.clear = function(){
    for (mon in this.monitors){
      try{
	mon.clear();
      } catch (exc) {
      }
    }
  }

  this.firsttime = true;
  this.tick  = function(ticks, tlm, restart)
    {
      //got a tick, so clear timeout (serer is alive -- no need to restart stream)
      if (this.timeoudid!=0)
	clearTimeout(this.timeoutid);
      ///////////this.time=parseFloat(time);
      this.ticks++;
      this.time = ticks;
      if (this.timeview != null)
	this.timeview.innerHTML = "<strong >"+(new Date(ticks*1000)).toUTCString()+"</strong>";
      for (i in this.epochmonitors)
	try{
	  this.epochmonitors[i].tick(this.time);
	} catch (e){
	}
      dbgelement=document.getElementById("dbg");
      for (monname in tlm.tlm){
 	attrvals=tlm.tlm[monname];
	length=attrvals.length;
	for (attr in attrvals) {
	  if (length>1)
	    tag=monname+".a"+attr;
	  else
	    tag=monname;
	  value=attrvals[attr];
	  if (value.length > 1){
	    //have array value, so treat each element as monitor
	    for (valindex in value){
	      tag=tag+"["+valindex+"]";
	      if (this.monitors[tag])
		{
		  listeners=this.monitors[tag];
		  for (index in listners){
		    listeners[index].setValue(value[valindex],0);
		  }
		}
	    }
	  } else {
	    listeners=this.monitors[tag];
	    for (index in listeners){
	      try{
		  listeners[index].setValue(value, 0);
	      } catch(e){}
	    }
	  }
	}
	
      }
      
      if (restart==true)
	{
	  //if server has died, restart stream
	  this.restart();
	}
      else
	//we set a timeout so that if we don't receive a tick in 
	//an allotted time, we assume the server thread died and
	//need to restart.  some servers will not allow infinite comet connections
      	this.timeoutid=setTimeout('initializeTelemetry()',TELEMETRY_TIMEOUT);
      
    };
  
  this.setFormat  = function( value )
    {
      if (this.formatview!=null)
	this.formatview.innerHTML="<strong>Format "+value+"</strong>";
    };
    
  this.setMonitor  = function(monname, value, criticality)
    {
      //perform necessary logging if conditions warrant
      crit=this.crits[monname];
      if (!crit) crit=NOMINAL;
      if (logger)
	switch(criticality)
	  {
	  case NOMINAL:
	    if(crit != NOMINAL)
	      {
		logger.log("Monitor "+monname + " returned to nominal", criticality);
	      }
	    break;
	  case CLOSETOLIMITS:
	    if(crit==NOMINAL)
	      {
		logger.log("Monitor "+monname + " approaching limits",criticality);
	      }
	    else if (crit==OFFNOMINAL)
	      {
		logger.log("Monitor "+monname + " now within limits",criticality);
		
	      }
	    break;
	  case OFFNOMINAL:
	    if(crit!=OFFNOMINAL)
	      {
		logger.log("Monitor "+monname + " out of limits",criticality);
	      }
	    break;
	  }
      this.crits[monname]=criticality;
      
      //update all monitors with new values
      monitors=this.monitors[monname];
      for (index in monitors)
	{
	  monitors[index].setValue(value, criticality);
	}
      
    };
    
  this.onUnload =  function() {
    if (this.connection) {
      this.connection = false; // release the iframe to prevent problems with IE when reloading the page
    if (this.connection2) {
      this.connection2 = false; // release the iframe to prevent problems with IE when reloading the page
    }
    }
  };
    

  //each epoch monitor will be called every time a "tick" is received.
  //this is used to keep time reference within the telemetry stream.
  //each epoch monitor must implement a "tick" method which takes a single
  //time paremeter
  this.addEpochMonitor =  function(monitor){
    this.epochmonitors[this.epochmonitors.length]=monitor;
    return this.epochmonitors.length-1;
  };
      
  this.removeEpochMonitor =  function(index){
    this.epochmonitors.splice(index,1);
  };


  //monitors must implement a methoc of form setValue( time,value, criticality)
  //if a time reference is needed, the monitor should also act as
  //an epoch monitor
 this.addMonitor =  function(monitor, monname){   
   if (!this.monitors[monname])
     this.monitors[monname]=new Array();
   monitors=this.monitors[monname];
   monitors[monitors.length]=monitor;
  
 };
 

 this.removeMonitor =  function(rmmonitor,monname){
   monitor=this.monitors[monname];
   for (i in monitor){
     if (monitor[i]==rmmonitor){
       monitor=monitor.splice(i,1);
       return;
     }
   }
 };


}
  

