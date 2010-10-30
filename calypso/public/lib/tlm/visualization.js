if (!calypso){
  var calypso={};
  calypso.tlm={};
}
//try{
//google.load('visualization','1',{packages:['gauge','areachart','linechart','columnchart','scatterchart']});
// } catch (e){ alert(e);}

function cloneObject(source) {
    for (i in source) {
        if (typeof source[i] == 'source') {
            this[i] = new cloneObject(source[i]);
        }
        else{
            this[i] = source[i];
	}
    }
}



function colourNameToHex(colour)
{
    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo ":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colours[colour.toLowerCase()] != 'undefined')
        return colours[colour.toLowerCase()];

    return false;
}


calypso.tlm.visualizationMonitor=function (name,dataset,row,col){

  this.dataset=dataset;
  this.row=row;
  this.col=col;
  this.name = name;
  this.criticality=0;
 
  
  /**
   * set the value and criticality of this monitor
   */
  this.setValue = function( value, criticality){
	  this.criticality=criticality;
	  this.data.setValue(this.row, this.col, value);
   };
   
};


calypso.tlm.Single_Monitor_List= function(historical){
	this.multilist=false;
	this.historical=historical?true:false;
	this.monitors = {};
	this.data=new google.visualization.DataTable();
	this.data.addColumn("string","monitor_name");
	if (historical){
		this.data.addColumn('string','Time');
		this.data.addRows(1);
	}
	this.data.addColumn("number","value");

		
	this.add_attribute= function(monitor_name, attrname){
		if (!this.monitors[monitor_name]){
			this.monitors[monitor_name]={};			
	
		}
		if(!this.monitors[monitor_name][attrname]){
			this.monitors[monitor_name][attrname]=true;
			if(this.historical){
				this.data.addColumn("number",monitor_name+"."+attrname);
				var colcount=this.data.getNumberOfColumns();
				var rowcount=this.data.getNumberOfRows();
				this.data.setValue(rowcount-1,colcount-1, colcount*rowcount)
			} else {
				this.data.addRows(1);
				var row=this.data.getNumberOfRows()-1;
				this.data.setValue(row, 0, monitor_name + "."+ attrname);
				this.data.setValue(row, 1, row+1);
			}
		}
  }
  
  this.contains=function(monitor_name, attrname){
	  return this.monitors[monitor_name]?(this.monitors[monitor_name][attrname]?true:false):false;
  };
  
  this.insert_monitor=function(monitor_name, before_monitor){
	  var new_list={};
	  for (id in this.monitors){
		  if (before_monitor==id) {
			  new_list[monitor_name]={};			  			
		  }
		  //this will reset the value of new_list[monitor_name] if id==monitor_name, which is what we want
		  new_list[id]=this.monitors[id];		  			  		  		 
	  }
	  
	  this.monitors=new_list;
	  //NOTE: for data, since this it is anticipated for this class that all data 
	  //will be displayed on one chart, there is no need to change order.  Probably
	  //not for single list either, unless we convert to a multi list when changing
	  //type during editing
  };
  
  this.insert_monitor_at_index=function(monitor_name, before_index){
	  var new_list={};
	  var count=0;
	  for (id in this.monitors){
		  if (before_index==count){
			  new_list[monitor_name]={};
		  }
		  ++count;
		  //this will reset the value of new_list[monitor_name] if id==monitor_name, which is what we want
		  new_list[id]=this.monitors[id];
		  }
	  this.monitors=new_list;
  };
  
  this.remove_monitor=function(monitor_name, attrname){
	  var row;
	  if(attrname==null){
		  delete this.monitors[monitor_name];	 
		  for (row=0; row < this.data.getNumberOfRows(); ++row){			  
			  if (!this.data.getValue(row,0) || this.data.getValue(row, 0).split('.')[0]==monitor_name){
				  this.data.removeRow(row);
			  }
		  }
	  }else {
		  for (row=0; row < this.data.getNumberOfRows();++row){
			  if( this.data.getValue(row,0)==monitor_name && 
				  this.data.getValue(row,1)==attrname){
				  this.data.removeRow(row);
				  this.data[monitor_name][attrname]=false;
				  break;		
			  }
		  }	
		  
		  
		  if (this.data.getNumberOfRows() ==0) {
			  this.remove_monitor(monitor_name, null);
		  }
	  }

  };
 
  
  this.datapoint=function(monitor_name,attrname){
	  var datapoint={data:this.data}
	  if (historical){
		  var row=this.data.getNumberOfRows()-1;
		  for(col = 2; col < this.data.getNumberOfRows(); ++col){
			  if (this.data.getColumnLabel(col)==monitor_name+"."+attrname){
				  datapoint.col=col;
				  break;
			  }
		  }
	  } else {
		  datapoint.col=1;
		  for (row=0;row < this.data.getNumberOfRows();++row){
			  if (this.data.getValue(row, 0) == attrname || 
				   this.data.getValue(row,0) == monitor_name+"."+attrname){
				  datapoint.row=row;
				  break;
			  }
				  
		  }
	  }
	  return datapoint;
  };
  
  this.arrange=function(monitor_name_order){
	  var newlist={};
	  for (index in monitor_name_order){
		  var monitor_name=monitor_name_order[index];
		  if(this.monitors[monitor_name]){
			  newlist[monitor_name]=this.monitors[monitor_name];			 
		  }
	  }
	  //append leftovers
	  for (leftover in this.monitors){
		  if(!newlist[leftover]){
			  newlist[leftover] = this.monitors[leftover];
		  }
	  }
	  this.monitors=newlist;
  };
  
}


calypso.tlm.Multi_Monitor_List= function(historical, fully_qualed_names){
	this.multilist=true;

	this.historical=historical?true:false;
	this.monitors = {};
	this.data={};
	this.fully_qualed_names=fully_qualed_names;
		
	this.add_attribute= function(monitor_name, attrname){
		if (!this.monitors[monitor_name]){
			this.monitors[monitor_name]={};			
			this.data[monitor_name]=new google.visualization.DataTable();
			this.data[monitor_name].addColumn("string","monitor_name");
			this.data[monitor_name].addColumn("number","value");

		}
		if(!this.monitors[monitor_name][attrname]){
			var row=0;
			for (id in this.monitors[monitor_name]){
				if (id==attrname) break;
				if(this.monitors[monitor_name][id]) ++row;
			}			
			this.monitors[monitor_name][attrname]=true;
			this.data[monitor_name].insertRows(row,1);
			//var row=this.data[monitor_name].getNumberOfRows()-1;
			if(this.fully_qualed_names)
				this.data[monitor_name].setValue(row, 0, monitor_name + "."+ attrname);
			else 
				this.data[monitor_name].setValue(row, 0,  attrname);
			this.data[monitor_name].setValue(row, 1, row+1);
		}
  }
  
  this.contains=function(monitor_name, attrname){
	  return this.monitors[monitor_name]?(this.monitors[monitor_name][attrname]?true:false):false;
  };
  
  this.insert_monitor=function(monitor_name, before_monitor){
	  var new_list={};
	  var new_data={};
	  for (id in this.monitors){
		  if (before_monitor==id) {
			  new_list[monitor_name]={};			  
			  new_data[monitor_name]=new google.visualization.DataTable();
			  new_data[monitor_name].addColumn("string","monitor_name");
			  new_data[monitor_name].addColumn("number","value");

		  }
		  //this will reset the value of new_list[monitor_name] if id==monitor_name, which is what we want
		  new_list[id]=this.monitors[id];		  			  		  
		  new_data[id]=this.data[id];
	  }
	  this.monitors=new_list;
	  this.data=new_data;
  };
  
  this.insert_monitor_at_index=function(monitor_name, before_index){
	  var new_list={};
	  var new_data={};
	  var count=0;
	  for (id in this.monitors){
		  if (before_index==count){
			  new_list[monitor_name]={};
			  new_data[monitor_name]=new google.visualization.DataTable();
			  new_data[monitor_name].addColumn("string","monitor_name");
			  new_data[monitor_name].addColumn("number","value");
		  }
		  ++count;
		  //this will reset the value of new_list[monitor_name] if id==monitor_name, which is what we want
		  new_list[id]=this.monitors[id];
		  new_data[id]=this.data[id];
	  }
	  this.monitors=new_list;
	  this.data=new_data;
  };
  
  this.remove_monitor=function(monitor_name, attrname){
	  var row;
	  if(this.data[monitor_name]){
		  if(attrname==null){
			  delete this.data[monitor_name];
			  delete this.monitors[monitor_name];	 
		  }else {
			  var data=this.data[monitor_name];
			  for (row=0; row < data.getNumberOfRows();++row){
				  if( !data.getValue(row,0) || data.getValue(row,0)==monitor_name+"."+attrname ||
				      data.getValue(row,0)==attrname){
					  data.removeRow(row);		
					  this.monitors[monitor_name][attrname]=false;
					  break;
				  }
			  }
			  
			  if (data.getNumberOfRows() ==0) {
				  delete this.data[monitor_name];
				  delete this.monitors[monitor_name];	
			  }
		  }

	  }
  };
  
  this.arrange=function(monitor_name_order){
	  var newlist={};
	  var newdata={};
	  for (index in monitor_name_order){
		  var monitor_name=monitor_name_order[index];
		  if(this.monitors[monitor_name]){
			  newlist[monitor_name]=this.monitors[monitor_name];			 
			  newdata[monitor_name]=this.data[monitor_name];
		  }
	  }
	  //append leftovers
	  for (leftover in this.monitors){
		  if(!newlist[leftover]){
			  newlist[leftover] = this.monitors[leftover];
			  newdata[leftover] = this.data[leftover];
		  }
	  }
	  this.monitors=newlist;
	  this.data=newdata;
  }
 

  this.datapoint=function(monitor_name,attrname){
	  var datapoint={data:this.data[monitor_name], col:1};		  
	  for (row=0;row < this.data[monitor_name].getNumberOfRows();++row){
		  if (this.data[monitor_name].getValue(row, 0) == attrname || 
				  this.data[monitor_name].getValue(row,0) == monitor_name+"."+attrname){
			  datapoint.row=row;
			  break;
		  }	  
	  }
	  return datapoint;
  };
}

/**
 * Class representing the base class for all display objects (tables, column charts, gauges, etc.)
 * within calypso
 */
calypso.tlm.visualization= function(chart, title, displayattrs, historical, element){
  this.displayattrs=displayattrs;
  this.content=element;
  this.title=title;
  this.chart = chart;
  this.displayattrs = displayattrs;
  this.displayattrs['title']=title;
  this.rows=new Array();
  this.historical = historical;
  this.displayattrs={};
  this.displayattrs.width=displayattrs.width?displayattrs.width:200;
  this.displayattrs.height=displayattrs.height?displayattrs.height:200;
  this.monitors={};
  this.monitor_list=new calypso.tlm.Multi_Monitor_List(false, false);
  this.every=0.0;
  this.lasttime=-100000.0;
  this.properties_ui=$('<div></div>'); 
  this.properties={}
  
  this.get_monitor_list = function(){
	 
	  return this.monitor_list;
  };
  
  this.get_title = function(){return this.title;};
  
  this.remove_monitor = function(monitor_name, attrname){
	  if (!this.monitor_list.monitors[monitor_name]) {
		  return;
	  }
	  this.monitor_list.remove_monitor(monitor_name, attrname);
		
	  if( attrname == null && this.viewers){
		  delete this.viewers[monitor_name];
	  }
	
	  this.reconstruct(); 
	  this.draw_chart();
	  
  };
	  
  
  
  /*
   * This will reconstruct the underlying HTML elements of the display chart, if
   * necessary.  Specifically, when tiles are being edited, addition or removal of 
   * new elements to display may necessitate a reconstruction of the display layout
   */
  this.reconstruct = function(){
	  //default is to do nothing
  };
  
  /*
   * This is the procedure that should be accessed to draw this object;
   * Subclasses should not override this, but should override "draw" instead
   */
  this.draw_chart = function(){
	  for (id in this.monitors){
		

		  //we know this object now has monitors, 
		  //so just draw it;  probably a better way 
		  //exists to do this, but for now ...
		  this.draw();
		  return;
	  }	  
	  this.proxy=true;
	  this.displayattrs.title="Samlpe Only"
	  if (!this.monitor_list.multilist){
		 var list=new calypso.tlm.Single_Monitor_List(this.monitor_list.historical);
	  } else{
		 var list=new calypso.tlm.Multi_Monitor_List(this.historical, true);//this.fully_qualed_names);
	  }
	  
	  list.add_attribute("Example1", "Attribute1");
	  list.add_attribute("Example1", "Attribute2");
      list.add_attribute("Example2", "Attribute1");      
      mylist=this.monitor_list;
      this.monitor_list=list;
      try{
    	  this.reconstruct();
    	  this.draw();
      } catch(e) {}
      this.monitor_list=mylist;
  }
  
  /**
   * draw this visualization object
   */
  this.draw = function(ignore_exceptions){
	 
  //  try{
      this.chart.draw(this.monitor_list.data, this.displayattrs);
   // } catch(e){
   // 	if(!ignore_exceptions)
   // 		alert("EXCEPTION Drawing Chart " + this.title + " : " + e);
   // 	    throw e;
    //}
  }

  /**
   * set the visibility of this chart
   */
  this.set_visible=function(visible){
	  if (visible)
		  this.content.style.display='block';
	  else	
		  this.content.style.display='none';

  }

  /**
   * indicate an update in time has occurred
   */
  this.tick = function(time){
	  if ((time - this.lasttime) >= this.every)
		  this.draw_chart();
	  this.lasttime=time;
	  if (this.historical){
		  this.data.addRows(1); 
		  if (this.data.getNumberOfRows() > this.displayattrs.maxlength){
			  this.data.removeRow(0);
		  }
		  var row = this.data.getNumberOfRows()-1;
		  if (row < 0) alert("ERROR");
		  this.data.setValue(row, 0, time)
	  }
	
   }
  
  /**
   * Clear all data from this element
   */
  this.clear = function(){
    this.data.removeRows(0, this.data.getNumberOfRows());
  }

  /**
   * start receiving data from a telemetry stream
   */
  this.start = function(telemetryStream){
	if (telemetryStream){
		telemetryStream.addEpochMonitor(this);
		this.telemetryStream = telemetryStream;
		for (mon in this.monitors){
			this.telemetryStream.addMonitor(this.monitors[mon],mon);
		}
    }
  }

  this.arrange= function(arrangement){
     this.monitor_list.arrange(arrangement);
     this.reconstruct();
     this.draw();
  };
  
  this.add_monitor = function( monitor_name, attrname, before_index){
	  if(this.proxy && monitor_name!="Example1" && monitor_name!="Example2"){
		  this.remove_monitor("Example1");
		  this.remove_monitor("Example2");
		  this.proxy=false;
	  }

	  this.monitor_list.insert_monitor_at_index(monitor_name,before_index);
	  if (this.monitor_list.contains(monitor_name,attrname)) return;//already got it
	  this.monitor_list.add_attribute(monitor_name,attrname);
		  	
	  
	  var id=monitor_name+"."+attrname;
	  var datapoint=this.monitor_list.datapoint(monitor_name, attrname);
	  var monitor= new calypso.tlm.visualizationMonitor(id, datapoint.data, datapoint.row, datapoint.col);
	  this.monitors[id]=monitor;
	  
	  this.reconstruct();
	  this.draw(true);
	  
   };	
  
  /*
   * This adds a display property with the given name, type, default value and optional enumeration values 
   * (applicable only to type "choice" and "selection").  Possible types are:
   * "switch" : boolean toggle switch 
   * "value" : text input
   * "color"  : text/color picker input to express a color
   * "choice" : radio button selection among a set of provided enumeration values
   * "selection" : drop down menu from a selection of provided enumeratin values
   * @return  an HTML element representing the input user interface for the display property
   */
  this.add_display_property = function(label, propertyname, type, default_value, enum_values){
	  this.displayattrs[propertyname]=default_value;
	  this.properties[propertyname]={
		  type:type,
		  label:label,
		  enum_values:enum_values
	  }
	  var main=$('<div></div>');
	  var div;
	  
	  if (default_value && typeof(default_value)!="string" &&  default_value.length){
		  for (index in default_value){
			  var input;
			  var labelelem=$('<td  style="width:200px">' + label + ' ' + index + ':  </>');
			  main.append(labelelem);			  
			  switch(type){
			  case "switch":
				  if (!default_value[index])
					  input=$('<input type="checkbox">'+propertyname+'</input>');
				  else
					  input=$('<input type="checkbox" checked="'+default_value[index]+'" >'+propertyname+'</input>');
				  input[0].model=this;
				  input[0].property=propertyname;
				  input[0].index=index;
				  input.change(function(){
					  this.model.displayattrs[this.property][this.index]=$(this).attr('checked');
					  this.model.draw_chart();
				  });
				  main.append(input);
				  break;
			  case "value":
				  input=$('<input type="text" value="'+default_value[index]+'"></input>')
				  input[0].model=this;
				  input[0].property=propertyname;
				  input[0].index=index;				  
				  input.change(function(){
					  this.model.displayattrs[this.property][this.index]=$(this).attr('value');
					  this.model.draw_chart();
				  });
			      main.append(input);
			      break;
			  case "color":
				  input=$('<input id="'+propertyname+index+'_input" name="'+propertyname+index+'_input"  type="text" value="'+default_value[index]+'"></input>');
				  div=$('<div class="colorpicker" id="'+propertyname+index+'_colorpicker" name="'+propertyname+index+'_colorpicker"></div>');
				  $('#prop_candy').prepend(div);
				  div.css('display','none');
				  div.css('z-index','500');
				  input[0].model=this;
				  input[0].property=propertyname;
				  input[0].index=index;
				  input[0].div=div;
				  input.css('background-color',default_value[index]);
				   main.append(input);
				  if (colourNameToHex(default_value[index])){
					  input.attr('value',colourNameToHex(default_value[index]))
				  } 
				  input.focus(function(){
							this.div.farbtastic($(this));	
							
							this.div.css('display','inline');
							this.model.focused=true;
					  
							
				  });
				  input.blur(function(){
						  
					    this.model.focused=false;
						
					 	$('.colorpicker').css('display','none');
				  });
				  if(propertyname=='background color')
					  input.change(function(){
						  this.model.displayattrs[this.property][this.index]=$(this).attr('value');
					  });
				  else
					  input.change(function(){
						  this.model.displayattrs[this.property][this.index]=$(this).attr('value');			  
						  this.model.draw_chart();
					  });
				  main.append(input);
				  break;
			  case "choice":
				  for (val in enum_values){
					  var radio;
					  if(val==default_value)
						  radio=$('<input type="radio" name="'+propertyname+index+'_option_layout" value="'+val+'" checked="checked" >'+enum_values[val]+'</input>');
					  else
						  radio=$('<input type="radio" name="'+propertyname+index+'_option_layout" value="'+val+'" >'+enum_values[val]+'</input>');
					  radio[0].model=this;
					  radio[0].property=propertyname;
					  radio[0].index=index;
						
					  radio.change(function(){
						  if ($(this).attr('checked'))
							  this.model.displayattrs[this.property][this.index]=$(this).attr('value');
						  this.model.draw_chart();
					  });
					  main.append(radio);
				  }
				  break;
			  case "selection":
				  select=$('<select id="'+propertyname+'_select"><select>');		 
				  for (val in enum_values){
					  var option;
					  if (val==default_value[index])
						  option=$('<option value="'+val+'" selected="selected" >'+enum_values[val]+'</selection>');
					  else
						  option=$('<option value="'+val+'" >'+enum_values[val]+'</selection>');
					  select.append(option);
				  }
				  var input=select;
				  input[0].model=this;
				  input[0].property=propertyname;
				  input[0].index=index;					
				  input.change(function(){
					  this.model.displayattrs[this.property][this.index]=$(this).find('option[selected=selected]').attr('value');
					  this.model.draw_chart();
				  });
				  main.append(select);
				  break;
			  };	
		  }
	  } else {
		  var label=$('<td  style="width:200px">'+label+':  </>');
	 	  main.append(label);
		  div=$('<div id="'+propertyname+'_colorpicker" name="'+propertyname+'_colorpicker"></div>');
		  switch(type){
		  case "switch":
			  if (default_value)				  
				  input=$('<input type="checkbox" checked="'+default_value+'" >'+propertyname+'</input>');
			  else
				  input=$('<input type="checkbox" >'+propertyname+'</input>');
				
			  input[0].model=this;
			  input[0].property=propertyname;
			  input.change(function(){
				  this.model.displayattrs[this.property]=$(this).attr('checked');
				  this.model.draw_chart();
			  });
			  main.append(input);
			  break;
		  case "value":
			  input=$('<input type="text" value="'+default_value+'"></input>')
			  input[0].model=this;
			  input[0].property=propertyname;
			  input.change(function(){
				  this.model.displayattrs[this.property]=$(this).attr('value');
				  this.model.draw_chart();
			  });
			  main.append(input);
			  break;
		  case "color"	:
			  input=$('<input id="'+propertyname+'_input" name="'+propertyname+'_input"  type="text" value="'+default_value+'"></input>');
			  main.append('<label class="ui-widget-header">'+propertyname+'</label>')
			  main.append(input);
			  //main.append(div);
			  $('#prop_candy').prepend(div);
			  div.farbtastic(input);	
			  div.css('display','none');
			  div.css('z-index','500');
			  input[0].model=this;
			  input[0].property=propertyname;
			  input[0].div=div;
			  input.focus(function(){
				  this.div.css('display','block');
				  this.div.css('float','right');
				  this.div.farbtastic($(this));
			  });
			  input.blur(function(){
				 
				  this.div.css('display','none');
			  });
			  if(propertyname=='background color')
				  input.change(function(){
					  this.model.displayattrs[this.property]=$(this).attr('value');
				  });
			  else
				  input.change(function(){
					  this.model.displayattrs[this.property]=$(this).attr('value');			  
					  this.model.draw_chart();
				  });
			  main.append(input);
			  break;
		  case "choice":
			  for (val in enum_values){
				  var radio;
				  if(val==default_value)
					  radio=$('<input type="radio" name="'+propertyname+'_option_layout" value="'+val+'" checked="checked" >'+enum_values[val]+'</input>');
				  else
					  radio=$('<input type="radio" name="'+propertyname+'_option_layout" value="'+val+'" >'+enum_values[val]+'</input>');
				  radio[0].model=this;
				  radio[0].property=propertyname;
				  radio.change(function(){
					  if ($(this).attr('checked'))
						  this.model.displayattrs[this.property]=$(this).attr('value');
					  this.model.draw_chart();	
				  });
				  main.append(radio);
			  }
			  break;
		  case "selection":
			  var option;
			  var select=$('<select id="'+propertyname+'_select"></select>');		 	
			  for (val in enum_values){
				  if (val==default_value)
					  option=$('<option value="'+val+'" selected="selected" >'+enum_values[val]+'</selection>');
				  else
					  option=$('<option value="'+val+'" >'+enum_values[val]+'</selection>');
				  select.append(option);
			  }
			  input=select;
			  input[0].model=this;
			  input[0].property=propertyname;
			  input.change(function(){
				  this.model.displayattrs[this.property]=$(this).find('option[selected=selected]').attr('value');
				  this.model.draw_chart();
			  });
			  main.append(select);
			  break;
		  }
	  }
	  return main;
  };
  
  this.properties_interface = function(){
	  return this.properties_ui;
  };
  
  this.container=function(){
	  return this.content;
  };
  
  this.set_display_properties = function( properties){
	  this.properties_ui.empty();
	  for (index in this.displayattrs){
		  if(properties[index]){
			  this.displayattrs[index]=parseFloat(properties[index]);
			  if(isNaN(this.displayattrs[index]))
				  this.displayattrs[index]=properties[index];
		  }		  
		  if (this.properties[index])
		  this.properties_ui.append(this.add_display_property
				  ( this.properties[index].label, index, this.properties[index].type, this.displayattrs[index], 
			        this.properties[index].enum_values))
	  }	  
	  

  };
  
  this.display_attributes=function(){
	  return this.displayattrs;
  };
  
  //initializers
  this.properties_ui.append(this.add_display_property('Title:', 'title', 'value', title));

}

//////////////////////////////
/*==================================
 * GAUGE
 *==================================
 */

google.load("visualization", "1", {packages:['gauge']});

calypso.tlm.GaugeVisualization= function(drawable, title, displayattrs){
	if(!displayattrs) displayattrs={}
	//The google gadget:
	//chart = new google.visualization.Gauge(drawable[0]);  
	displayattrs={ background_color: 'transparent',
  			   min :displayattrs.min?displayattrs.min:0,
		  	   max : displayattrs.max?displayattrs.max:100,
		  	   height: displayattrs.height?displayattrs.height:200,
		  	   width : displayattrs.width?displayattrs.width:200,
		  	   redFrom: displayattrs.redFrom?displayattrs.redFrom:90,
		  	   redTo:   displayattrs.redTo ? displayattrs.redTo:100,
		  	   yellowFrom: displayattrs.yellowFrom?displayattrs.yellowFrom:75,
			   yellowTo:   displayattrs.yellowTo ? displayattrs.yellowTo:90,
			   minorTicks: displayattrs.minorTicks?gaugattrs.minorTicks:5};
	//associate gadget with display:
	var gauge = new calypso.tlm.visualization(null,title,displayattrs, false,drawable[0]);
	gauge.myClass=calypso.tlm.GaugeVisualization;
	gauge.myClassName="GaugeVisualization";
	gauge.padding=15;
  
	gauge.properties_ui=$('<div></div>');
	with (gauge.properties_ui){
		append(gauge.add_display_property("minimum","min","value",displayattrs.min));  
		append(gauge.add_display_property("maximum","max","value",displayattrs.max));  
		append(gauge.add_display_property("red from","redFrom","value",displayattrs.redFrom));  
		append(gauge.add_display_property("red to","redTo","value",displayattrs.redTo));  
		append(gauge.add_display_property("yellow from","yellowFrom","value",displayattrs.yellowFrom));  
		append(gauge.add_display_property("yellow to","yellowTo","value",displayattrs.yellowTo));  
		append(gauge.add_display_property("minor ticks per major","minorTicks","value",displayattrs.minorTicks));  
	}
	
	//gauge.charts = [];
	//gauge.gaugemonitors=[];
	//gauge.data=[];
	gauge.moncount=0;
	gauge.every=3.0;//intensive rendering, so render at most once every 3 seconds
	gauge.viewers={};
  
	{
	  var table=$('<table><tbody></tbody></table>');
	  gauge.content= $('<tr></tr>');
	  table.append(gauge.content);
	  drawable.append(table);
	}
	gauge.content.css('display','inline');
	gauge.draw = function(){
		try{
			var attr_count=0;
			for (index in this.viewers){
				attr_count+=this.monitor_list.data[index].getNumberOfRows();
			}
			for (index in this.viewers){
				var dispattrs=new cloneObject(this.displayattrs);
				var this_attr_count=this.monitor_list.data[index].getNumberOfRows();				
				dispattrs.width=(dispattrs.width*this_attr_count)/attr_count;
				this.viewers[index].draw(this.monitor_list.data[index], dispattrs);
			}
		} catch (e){alert("ERROR DRAWING GAUGE: " + e);}
	};
	//gauge.content.draw_chart=gauge.draw_chart;
   
	gauge.reconstruct=function(){
		this.content.empty();
		for(monitor_name in this.monitor_list.data){
			var td=$('<td id="'+monitor_name+'_element"style="text-align:center"><h4 class="ui-state-active" >'+monitor_name+'</h4>'+
					'</td>'
			);
			var div=$('<div></div>');
			td.append(div);		
			with ($(td)){
				css('height',this.displayattrs.height?this.displayattrs.height+'px':'200px');
				css('text-allieng','center');
				css('margin',0);
				css('padding',0);
			}	
			this.viewers[monitor_name] =  new google.visualization.Gauge(div[0]);  
			this.viewers[monitor_name].title=monitor_name;
			this.content.append(td);
		}
	};
	
 
   
 
  
  gauge.tick = function(time){
	  if ((time - this.lasttime) >= this.every){
			  this.draw();
	  }
	  this.lasttime=time;
  };
		  
 
  gauge.description="Gauges are used for data that exhibit smooth variations in time, and often for data that has well-defined limits of acceptance.";
  return gauge;
};

calypso.tlm.Snapshot = function (element, gglchart, title, displayattrs){
	  if(!displayattrs) displayattrs={}
	  displayattrs.fontSize=displayattrs.fontSize?displayattrs.fontSize:10;
	  var chart = new calypso.tlm.visualization(gglchart,title,displayattrs, false, element);
	  chart.every=5.0;//intensive rendering
	  chart.chart=gglchart;
	
	  with (chart.properties_ui){
		  append(chart.add_display_property("font size","fontSize","value",displayattrs.fontSize));
	  }
	  return chart;
 
};

google.load("visualization", "1", {packages:['piechart']});
calypso.tlm.PieChartVisualization = function(drawable, title, displayattrs){
	
	if(!displayattrs) displayattrs={};
	if(!displayattrs.colors)
		displayattrs.colors=['blue','red','orange','green','purple'];
	displayattrs.is3D=displayattrs.is3D?displayattrs.is3D:false;
	displayattrs.pieSliceText=displayattrs.pieSliceText?displayattrs.pieSliceText:'percentage';
	var gglchart = new google.visualization.PieChart(drawable[0]);
																
    var chart= new calypso.tlm.Snapshot(drawable, gglchart, title, displayattrs);
    chart.monitor_list=new calypso.tlm.Single_Monitor_List(false);
    with (chart.properties_ui){
  	    append(chart.add_display_property("Pie slice display","pieSliceText","choice",displayattrs.pieSliceText,
			  ["percentage","value","label", "none"]));
    	append(chart.add_display_property("colors","colors","color",
    		displayattrs.colors));
    	append(chart.add_display_property("Display in 3D","is3D","switch",
    		displayattrs.is3D));
    }
    chart.description="Pie charts are generally used only on data that exhibits change over very long periods of time.  An example might be data that represent an average over a long period of time that exhibits only minor fluctuations"
    chart.myClass=calypso.tlm.PieChartVisualization;
  	chart.myClassName="PieChartVisualization";
  	chart.hide_on_resize=true;
    return chart;
};


calypso.tlm.TimeSeries= function(element, title, displayattrs, gglchart){
  if(!displayattrs) displayattrs={}
  displayattrs.backgroundColor=displayattrs.backgroundColor?displayattrs.backgroundColor:'none';
  displayattrs.foregroundColor=displayattrs.foregroundColor?displayattrs.foregroundColor:'black';
  displayattrs.height=displayattrs.height?displayattrs.height:200;
  displayattrs.width=displayattrs.width?displayattrs.width:200;
  displayattrs.minValue=displayattrs.minValue?displayattrs.minValue:0;
  displayattrs.maxValue=displayattrs.maxValue?displayattrs.maxValue:100;
  var chart = new calypso.tlm.visualization(gglchart,title, displayattrs, true, element);
  chart.every=5.0;//intensive rendering
  chart.chart=gglchart;
  chart.displayattrs = displayattrs;
  chart.monitor_list=new calypso.tlm.Single_Monitor_List(true);
  with (chart.properties_ui){
	  append(chart.add_display_property('Min Value','minValue', 'value', displayattrs.minValue));
	  append(chart.add_display_property('Max Value','maxValue', 'value', displayattrs.maxValue));
	  append(chart.add_display_property('Background Color','backgroundColor', 'color', displayattrs.backgroundColor));
	  append(chart.add_display_property('Foreground Color','foregroundColor', 'color', displayattrs.foregroundColor));
  }
  return chart;
};

google.load("visualization", "1", {packages:['areachart']});

calypso.tlm.AreaChartVisualization= function(drawable, title, displayattrs){
    if(!displayattrs) displayattrs={}
	var gglchart = new google.visualization.AreaChart(drawable[0]);  
	var chart=calypso.tlm.TimeSeries(drawable,title, displayattrs, gglchart);
	chart.description="This type of chart charts one or multiple data points in  time, with area filled in below each plotted item.  This type of chart is useful for capturing historical trending"+
	   "of multiple data points and visually showing the differences in values."
	chart.myClass=calypso.tlm.AreaChartVisualization;
	chart.myClassName="AreaChartVisualization";
    return chart;	 
};


google.load("visualization", "1", {packages:['linechart']});

calypso.tlm.LineChartVisualization= function(drawable, title, displayattrs){
	
  var gglchart = new google.visualization.LineChart(drawable[0]); 
  if(!displayattrs) displayattrs={}
  var chart= calypso.tlm.TimeSeries(drawable,title, displayattrs, gglchart);
  chart.myClass=calypso.tlm.LineChartVisualization;
  chart.myClassName="LineChartVisualization";
  return chart;
};

calypso.tlm.ColumnChartVisualization= function(drawable, title, displayattrs,snapshotview){
  if(!displayattrs) displayattrs={}
  var gglchart = new google.visualization.ColumnChart(drawable[0]);  
  var chart = calypso.tlm.TimeSeries(drawable,title, displayattrs, gglchart);
  chart.myClass=calypso.tlm.ColumnChartVisualization;
  chart.myClassName="ColumnChartVisualization";
  chart.hide_on_resize=true;//resizing the iframe with this component doesn't work well, so hide when tile is being resized
  chart.baseDraw=chart.draw;
  chart.draw=function(){
	  displayattrs={};
	  for (index in this.displayattrs){
		  displayattrs[index]=this.displayattrs[index];
	  }
	  displayattrs['legendTextStyle']={color:this.displayattrs.foregroundColor};
	  displayattrs['titleTextStyle']={color:this.displayattrs.foregroundColor};
	  displayattrs['vAxis']={textStyle:{color:this.displayattrs.foregroundColor},
			   				 titleTextStyle:{color:this.displayattrs.foregroundColor},
			   				 minValue:  this.displayattrs.minValue,
			   				 maxvalue : this.displayattrs.maxValue};
	  displayattrs['hAxis']={textStyle:{color:this.displayattrs.foregroundColor},
			                 titleTextStyle :{color:this.displayattrs.foregroundColor}};
	  try{
		  this.chart.draw(this.monitor_list.data, displayattrs);
	  } catch(e) {
		  alert("ERROR drawing tile: " + e)
	  }
	
  }
  return chart;
};


calypso.tlm.BarChartVisualization= function(drawable, title, displayattrs,snapshotview){
  if(!displayattrs) displayattrs={}
  var gglchart = new google.visualization.BarChart(drawable[0]);  
  var chart = calypso.tlm.Snapshot( drawable, gglchart, title, displayattrs)
  
  chart.myClass=calypso.tlm.BarChartVisualization;
  chart.myClassName="BarChartVisualization";
  chart.description="Bar charts depict values as columns of corresponding height for a single snapshot of time.  These are useful for quickly visualizing comparison of quantities of similar magnitude relative to each other."
  return chart;
};

google.load("visualization", "1", {packages:['scatterchart']});

calypso.tlm.ScatterChartVisualization= function(drawable, title, displayattrs){
    if(!displayattrs) displayattrs={}
	var gglgraph = new google.visualization.ScatterChart(drawable[0]);  
	var chart = calypso.tlm.TimeSeries(drawable,title, displayattrs, gglchart);
	chart.myClass=calypso.tlm.ScatterChartVisualization;
	chart.myClassName="ScatterChartVisualization";
	return chart;
};

calypso.tlm.TableVisualization = function(container, title, displayattrs){
    if(!displayattrs) displayattrs={}
 	var base=new calypso.tlm.visualization(null, title, {}, false, container);

	base.monitorname_as_title=false;
	base.every=0.0;
	base.lasttime=-100000.0;
	base.viewers={};
	base.monitor_list=new calypso.tlm.Multi_Monitor_List(false, true);
	base.myClass=calypso.tlm.TableVisualization 
	base.myClassName="TableVisualization";
	
	base.reconstruct = function(){
	   var table=$('<table ></table>');
	   var body=$('<tbody></tbody>');
	   table.addClass('tlm_display');
	   table.addClass('ui-widget-content');
	   for (monitor_name in this.monitor_list.data){		   
		   var mondata=this.monitor_list.data[monitor_name];
		   if(this.monitorname_as_title){
			   var newrow=$("<tr></tr>"); 
			   newrow.append($("<td colspan='2' style='text-align:center' class='tlm_label ui-widget-header'>"+monitor_name+"</td>"));
			   body.append(newrow);
		   }
		   for (row=0;row<mondata.getNumberOfRows();++row){
			   var newrow=$("<tr></tr>");		 
			   var labeltext=mondata.getValue(row,0);
			   if (this.monitorname_as_title){
				   var splittext=labeltext.split('.');
				   labeltext=splittext[splittext.length-1];
			   }
			   var label=$("<td>"+labeltext+"</td>");
			   label.addClass('tlm_label');
			   var valuecell=$("<td>"+mondata.getValue(row,1)+"</td>");
			   valuecell.addClass('tlm_value');
			   newrow.append(label);
			   newrow.append(valuecell);
			   body.append(newrow);
			  		   
			   if(!this.viewers[monitor_name]){
				   this.viewers[monitor_name]=new Array(0);
			   }			   
			   this.viewers[monitor_name][row]=valuecell;
		   }
				
	   }
	   table.append(body);
	   this.content.empty();	   
	   if(this.displayattrs.title && this.displayattrs.title!='')
		   	this.content.append($('<h3 style="text-align:center;padding:0;margin:0" class="ui-widget-header">'+this.displayattrs.title+'</h3>'))
	   this.content.append(table);	   
	};
	
	base.draw=function(){
		for (monitor_name in this.monitor_list.data){
			var cells=this.viewers[monitor_name];
			var data=this.monitor_list.data[monitor_name];
			for (row in cells){
				value=data.getValue(parseInt(row), 1);
				cells[row].html(""+value);
			}
		}
	};
	base.description="Tables are used for displaying collections of data values.  This type of display is useful where explicit access to data values is needed, particluarly when comparing multiple values "
	return base;
};


function get_visualization_class(name){
	switch(name){
      case "gauge":
          return calypso.tlm.GaugeVisualization;
          break;
      case "piechart":
          return calypso.tlm.PieChartVisualization;
          break;
      case "columnchart":
          return calypso.tlm.ColumnChartVisualization;
          break;
      case "linechart":
          return calypso.tlm.LineChartVisualization;
          break;
      case "barchart":
          return calypso.tlm.BarChartVisualization;
          break;
      case "areachart":
          return calypso.tlm.AreaChartVisualization;
          break;
      case "heatmap":
          return calypso.tlm.AreaChartVisualization;
          break;
      case "table":
      default:
          return calypso.tlm.TableVisualization;
          break;
   
	  }
}