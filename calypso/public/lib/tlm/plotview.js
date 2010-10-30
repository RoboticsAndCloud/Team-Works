////////////
//utility function
/////////
function findSWF(movieName) {
  if (navigator.appName.indexOf("Microsoft")!= -1) {
    return window[movieName];
  } else {
    return document[movieName];
  }
}

/////////////////
//This class represents a set of floating point data across
//a timespan. The data set is designed to receive callbacks
//(through setValue) each time a telemetry stream indicates
//an update occurs.  Since the value that is provided during 
// a callback need not be scalar, an index is provided to 
// know which element is to be pushed into this data set.  Also,
//the number of elements needed to backfill in the data set 
//(with null value) is given, to keep the data set synced with others
/////////////////
function Dataset(maxlength, index,backfill, plotattrs){
  this.data =new Array(backfill);
  this.maxlength=maxlength;
  this.time=false;
  this.index=index;
  this.plotattrs=plotattrs;


  this.clear = function(){
    this.data = new Array(0);
  }

  this.setValue= function( time, value, criticality){
    if(!this.time) this.time=time;//if first time, deltatime will be 0
    deltatime=time-this.time;
    this.time=time;
    
    //fill in dropped time frames with no data:
    while(--deltatime >0 ) this.data.push(null);
    //push new value into data set:
    this.data.push(parseFloat(value));

    //shift array to contain only max length values,
    //dropping oldest data
    while (this.data.length > this.maxlength)
      {
	this.data.shift();
      }    
    if (value < this.plotattrs.y_axis.min){
      this.plotattrs.y_axis.min=10*(parseInt(''+(value/10)));
      this.plotattrs.y_axis.steps = (this.plotattrs.y_axis.max  - this.plotattrs.y_axis.min)/10.0;
    }
    if (value > this.plotattrs.y_axis.max){
      this.plotattrs.y_axis.max=10*((parseInt(''+(value/10))) +1 ) ;
      this.plotattrs.y_axis.steps = (this.plotattrs.y_axis.max  - this.plotattrs.y_axis.min)/10.0;
    }
  };
}


///////////////
//This class is responsible for dsiplaying a plot across
//multiple data sets.  The timespan is the max amount
//of time to be displayed (x-axis) on the plot.
////////////
function PlotDisplay( timespan, ymin, ymax,title){
  this.chartelement = null;  
  this.title=title;
  this.started=false;
  //set up some colors for lines on the chart
  this.colors= new Array("#8888FF","#00FF00","#00FFFF","#FFFFFF",
			 "#FFFF00","#FF00FF","#4466FF");
  //set up default data for the chart
  this.data={
    "elements": [],
    "title": {
       "text": title,
       "style": "{color:#FFFFFF}"
     },
    "y_axis": {  "colour":"#888888", "grid-colour":"#888888", 
       	         "min": ymin, "max": ymax, "steps": ((ymax-ymin)/10.0) ,
	         "labels":{"colour":"#FFFFFF"}} ,
    "x_axis": { "colour":"#888888","grid-colour":"#888888",
	        "min": 0, "max": timespan, "steps": timespan/20.0,
	        "labels":{"colour":"#FFFFFF"}} ,
    "bg_colour":"#333333",
    "x_legend":{"text":"time","style":"{font-size:20px;color:#778877}"},
    "x_label":{"style":"{color:#FF8888}"}
  };

  this.maxelements=timespan;
  this.timestart=false;
  this.lasttime=0;
  //bool array to track if a monitor is already in chart or not
  this.monitors=new Array();
  //this is where the chart data is kept:
  this.datasets=new Array();
  this.shown=false;
  this.epochmonid=false;
  this.ticks=0;
  //grab initial position data
  this.position_top=document.getElementById('fullchart'+title).style.top;
  this.position_left=document.getElementById('fullchart'+title).style.left;
  this.z_index=2000;

  this.startplot= function(telemetryStream){
    //add monitors to telemetry stream for callback to start tracking
    //data updates
    for (monid in this.datasets)
      {
	id=this.datasets[monid].index;
	telemetryStream.addMonitor(this.datasets[monid], monid);
	this.monitors["mon"+monid]=true;
      }
    //set up the open flash chrat area
    swfobject.embedSWF('/lib/ofc/open-flash-chart.swf', 'chart'+title,
		       '950', '250', '9.0.0', 'expressInstall.swf',
		       {'get-data':'ofc_get_chart_data_'+title},
		       {'wmode':'transparent'});
    //to track time ticks from the telemetry Stream, to know
    //when the next time fram is
    this.epochmonid=telemetryStream.addEpochMonitor(this);
    this.ticks=0;
    this.shown=true;
    this.started=true;
  },

  this.stopplot=function(){
    for (monid in this.datasets){
      id=this.datasets[monid].index;
      telemetryStream.removeMonitor(this.datasets[monid],monid);
      this.monitors["mon"+monid]=false;
    }
    telemetryStream.removeEpochMonitor(this.epochmonid);
    this.started=false;
  };

  //shrink the plot window to only a title bar
  this.shrink=function(){
    this.stopplot();
    //set plot area invisible, but keep title bar visible
    elem=document.getElementById('chart'+this.title);
    elem.style.display='none';
    //track position for later expand if needed
    elem=document.getElementById('fullchart'+this.title);
    this.posistion_top=elem.style.top;
    this.position_left=elem.style.left;
    //place element back in relative position
    elem.style.top=0;
    elem.style.left=0;
    elem.style.z_index=1;
  }

  //expand chart from titlebar-only to full view
  this.expand=function(){
    if (this.shown)
      this.startplot();
    elem=document.getElementById('chart'+this.title);
    fullelem=document.getElementById('fullchart'+this.title);
    if (elem.style.display != 'block')
      {
	elem.style.display='block';
	fullelem.style.top=this.posistion_top;
	fullelem.style.left=this.position_left;
      }
    fullelem.parentNode.style.z_index=++this.z_index;
    this.chartelement=findSWF('chart'+this.title);
  };

  this.createDataset = function(montitle, monid, charttype, index,multi){
    if (charttype=='bar') charttype='bar_glass';
    if (this.monitors["mon"+monid]!=true)
      {
	indextext='';
	if (multi==true){indextext='['+(index+1)+']';}
	this.datasets[monid]=
	  new Dataset(this.maxelements,
		      index,
		      this.ticks<this.maxelements?this.ticks+2:this.maxelements,
                      this.data);
	dataset=this.datasets[monid];
	
	size=this.data.elements.length;
	color=this.colors[size%this.colors.length];
	//this will automatically start plotting the new 
	//data set if plot is active
	this.data.elements[size++]={
	  "type": charttype,
	  "fill-alpha": 0.35,    
	  "colour":  color,
	  "text": montitle,
	  //monitormap[''+monid]+indextext,
	  "values": dataset.data
	};
	if (!this.shown){
	  //	  document.getElementById('monlist'+title).innerHTML=
	  //  document.getElementById('monlist'+title).innerHTML+"<li>"
	  //  + indextext + "</li>";
	    // monitormap[''+monid]+indextext+"</li>";
	  //	  this.startplot();
	}
      } else {
      alert("Monitor already in chart.");
    }
    this.monitors["mon"+monid]=true;
  };


  this.close = function(){
    if(confirm('This will remove the plot'))
      {
	this.stopplot();
	document.getElementById('fullchart'+this.title).style.visibility='hidden';
	document.getElementById('chart'+this.title).style.visibility='hidden';
	
	
	url='plots.php?action=deleteplot&asset='+asset+
	"&host="+host+"&title="+title;
	document.getElementById('PHP').src=url; 
	document.getElementById('PHP').style.visibility='hidden';
     }
  };

  this.tick = function(time){
    if (!this.started){
      this.startplot();
      this.started=true;
    }
    this.update(time, this.ticks<this.maxelements?0:this.ticks-this.maxelements);
    ++this.ticks;
  }

  this.update= function(time,timeoffset){
    this.lasttime=time>this.maxelements?this.maxelements:time;
    this.data.x_legend.text="time(s)";
    if (timeoffset>0){
      this.data.x_axis.min=timeoffset;
      this.data.x_axis.max=timeoffset+this.maxelements;
    }
    if(this.chartelement==null) this.chartelement=findSWF("chart"+this.title);
    try{
      this.chartelement.load( JSON.stringify(this.data) );
    } catch(e){
      
    }
  };

}


