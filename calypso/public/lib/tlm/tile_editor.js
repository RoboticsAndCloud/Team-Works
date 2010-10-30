
//A convenience function added to jquery operations to make items "removable" by
//adding an "X" that when activated removes the item.
jQuery.fn.listremovable = function(){
     var remove_widget=$('<a  href="#" style="float:right;position:absolute;top:2px;left:90%;z-index:22;display:inline"' + 
                         'onclick="calypso.tlm.tile_editor.remove_monitor(\''+ $(this).children('h3').attr('id')+'\');'+
                               'return false;">'+
                       '<img  style="height:15px" src="/icons/removeX.png"></img>'+
                     '</a>');
    $(this).append(remove_widget);
    $(this).find('img').css('border','none');   
}

/*
 * A convenience function to add the capability to a list of input checkboxes
 * of selecting all or none through a single additional checkbox
 */
jQuery.fn.checklist=function(option, argument){
	if(!option) {
		/*
		 * If not options specified, then act on this element
		 * to add the necessary GUI attributes and controls
		 */
		this.find('input').change(function(){
			//The parent and all_input attributes are established 
			//in code just below 
			if ($(this).attr('checked')){
				this.parent[0].all_checked=true;
				this.parent.find('input').each(function(index,element){
					if (!$(element).attr('checked')){
						this.all_input.attr('checked',null);
						this.parent[0].all_checked=false;
						return;
					}				
				});
				if(this.parent[0].all_checked)
					this.all_input.attr('checked',true);
				
			} else {
				this.all_input.attr('checked',null);
				
			}
			if(this.parent[0].change_callback){
				this.parent[0].change_callback($(this), $(this).attr('checked'));
			}
		});
		this.children('ul').prepend('<hr></hr>');
		this.children('ul').css('margin',0);
		this.children('ul').css('padding',0);
		this.all_input=$('<input type="checkbox"></input><label>All</label>');
		var li=$('<li style="list-style:none;margin-left:0;padding-left:0" class="ui-widget"></li>')
		li.append(this.all_input);
		this.children('ul').prepend(li);
		this.find('li').css('margin',0);
		this.find('li').css('padding',0);
		self=this;
		this.find('input').each(function(index, element){
			element.all_input=self.all_input;
			element.parent=self;
		});
		this.all_input.parent=this;
		this.all_input.change(function(){
			var checked=$(this).attr('checked');
			this.parent.find('input').attr('checked',checked);
			this.parent.find('input').each(function(index,element){
			  this.parent[0].change_callback($(element),checked);	
			});
		});
	} else {
		//process string options passed in as first argument
		switch(option){
		case "changed":
			this[0].change_callback=argument;
			break;
		case "checkeditems":
				var attrs={};
				$(this).find('li').each(function(index, element){
					var attrname=$(element).children('label').text();
					var checked=$(element).children('input').attr('checked');
					if (argument) {
						if (attrname==argument){
							return checked;
						}
					} else {
						if (checked && attrname!="All") attrs[attrname]=true; 
						else if (attrname!="All") attrs[attrname]=false;
					}
				});
				return argument?false:attrs;
		default:
				throw ("$().checklist: Unknown option " + option);
		}
		
	}
	
};


jQuery.fn.monitor_droppable = function(tile_editor, with_insertion){
	this.tile_editor=tile_editor;
	$(this).droppable({accept:'.monitor_draggable',
    	drop:function(event, ui){        
    	  //clone the draggable and configure to be a part
    	  //of the current displayed monitor list                      
    	var monitor_name=ui.draggable.attr('id');
    	var attrs_div = $('#'+monitor_name+'_attrs').children('ul');
    	var attrs     = attrs_div.checklist("checkeditems");
     	if (with_insertion)
    		this.tile_editor.add_monitor(monitor_name, attrs,$(this).parent());
    	else
    		this.tile_editor.add_monitor(monitor_name,attrs, null);
    	//de-activate this element now in the main list:
     	ui.draggable.css('opacity',0.3);
    	ui.draggable.removeClass('monitor_draggable');
    	attrs_div.css('display','none');
 	      	
        }
    });  
};

/*
 * a convenience add-on to jQuery to allow for "toasts"
 */
jQuery.fn.toastable = function(properties){
	this.make_toast = function(){
		this.div.animate( {opacity:1.0},2000);
		this.div.animate( {opacity: 1.0}, this.duration*1000, function(){
		  $(this).animate({opacity:0.0},2000);
		});
	};
	var text=$(this).attr('title');
	$(this).attr('title',null);
	this.div=$('<div class="ui-widget-shadow"><p>'+text + '</p></div>');
	this.div.css('opacity',0.0);
	this.duration=properties.duration;
	$(this).append(this.div);
	
	switch (properties.when){
	case "oncreation":
		this.make_toast();
		break;
	case "onchange":	
		$(this).change(function(){
			this.make_toast();
		});
		break;
    default:
    	this.make_toast();
	}
   
	
}


/*
 * The main class: the tile editor.  This takes inputs that are the GUI elements for the global list of 
 * all monitors, one that will be the monitor list for the current tile, and a javascript class used
 * to create the tile display itself.
 */
calypso.tlm.Tile_Editor=function( ){
    
	/*
	 * ====================
	 * Initialization
	 * ====================
	 */
	//define the necessary GUI elements as attributes:
	this.tabs=$('#tile_editor_tabs');
	this.canvas_holder=$('#tile_canvas');
	this.canvas_drop=$('#tile_canvas_drop');
	this.plot_selection=$('#plot_type_selection');
	this.description=$('#tile_description');
	this.properties_element=$('#properties_ui');
	
	/*
	 * Initializer: called to set up display before it is set visible to user.
	 * Canvas is the current drawable item of the tile to be edited.  Ite 
	 * will be removed from the main display and placed in the editor while
	 * the user updates it.
	 */
	this.set_drawable = function(drawable, x_pos, y_pos){
	   

		this.canvas_holder.empty();
		this.canvas = drawable.container();
  		this.canvas_holder.toastable({duration:3,when:"oncreation"});
  		this.drawable=new drawable.myClass(this.canvas, drawable.get_title(), drawable.display_attributes());
//  	  	this.drawable=drawable;
		this.tile_position={ x_pos : x_pos,
				              y_pos : y_pos};
		
		this.parent=this.canvas.parent();//to restore to parent later, capture parent value here
		this.canvas.remove();
		this.canvas_holder.append(this.canvas);		
		this.canvas[0].tile_editor=this;
		//make sure proper display option is set
		this.plot_selection.find('option').attr('selected',null);//deslect any selected items
		this.plot_selection.find('option[id='+drawable.myClassName+']').attr('selected','selected');
		//reset monitor lists
		this.tile_monitor_list.empty();
		this.all_monitor_list.find('h3').css('opacity',1.0);
		this.all_monitor_list.find('div').css('opacity',1.0);
		
		var list=drawable.get_monitor_list().monitors;
		for (monitor_name in list){		
			
			this.add_monitor(monitor_name, list[monitor_name]);
		}
		//update the properties menu to reflect this type of tile:
		this.properties_element.empty();
		this.properties_element.append(this.drawable.properties_interface());

		//good to go: set the description and draw the tile in the editor
   	    this.description.html('<p>'+this.drawable.description+'</p>');
   	    this.drawable.draw_chart();
   	};

	
	
	this.plot_selection[0].tile_editor=this;
	//on change of plot type by user, must recreate/redraw components:
	this.plot_selection.change(function(){
		newclass=calypso.tlm[$(this).val()];
		this.tile_editor.change_type(newclass);
	});
	
	this.change_type=function(newclass){
		this.canvas.empty();
		var monitors=this.drawable.get_monitor_list().monitors;
		var title=this.drawable.title;
		var dispalyattrs=this.drawable.display_attributes();
		//reconstruct drawable based on new class  
		delete this.drawable;
		this.drawable=new newclass(this.canvas,title);
		//re-establish monitors to display
		this.tabs.tabs();
		this.properties_element.empty();
		this.properties_element.append(this.drawable.properties_interface());
		for (id in monitors){	
			for (attr in monitors[id]){
				this.drawable.add_monitor(id,attr);
			}
		}
		this.drawable.draw_chart();
		this.refresh();
		this.description[0].description_text=this.drawable.description;
		this.description.animate({opacity:0.0},1500,function(){
					$(this).html('<p>'+this.description_text+'</p>');
					$(this).animate({opacity:1.0},1500);
				})
	};

	this.in_sort=false;

    this.all_monitor_list=$('#monitor_list_all');
  	this.all_monitor_list.css('display','block');

    this.tile_monitor_list = $('#monitor_list');
    //add classes to monitor lists for easy global access through jQuery
    this.all_monitor_list.children('div').addClass('monitor_list');
    this.tile_monitor_list.addClass('monitor_list_sortable');
    this.tile_monitor_list.addClass('monitor_list');
    	   
    //Set up id's of all monitor elements to be that of the monitor itself for convenience
    $('.monitor_list').find('h3').each(function(index,element){
        $(element).attr('id',$(element).children('a').html());
        $(element).parent().attr('id',$(element).children('a').html());
           });
   //make the current monitor list for the tile sortable (orderable) by the user
    this.tile_monitor_list.tile_editor=this;
    $('.monitor_list_sortable').sortable({
    		axis: "y",
    		handle: "h3",
            start:function(){ 
    			this.tile_editor.in_sort=true;
    			$('.monitor_list').find('div').css('diplsay','none');
    		},
    		stop:function(event, ui){
    			var arrangement=$(this).sortable('toArray');
    			this.tile_editor.drawable.arrange(arrangement);
    		}
    });
     
    //allow the user to remove items from the current monitor list
    this.tile_monitor_list.children('div').listremovable();
                
    //make all monitor lists accordions, showing details of only one of the 
    //monitors at a time as user clicks on it
    this.tile_monitor_list.tile_editor=this;
    this.tile_monitor_list.accordion({header:"> div > h3",
    	//we must handle the case where user is sorting the current monitor
    	//list and disentangle it from an accordion action (jQuery will try to do both)
    	change:function(){
    	  if(this.tile_editor.in_sort) {
    		  this.tile_editor.tile_monitor_list.accordion('activate',false);
    		  this.tile_editor.in_sort=false;
                              
    	  }
        }
    
    });            
    //for call-back functions, set up objects to have a pointer to this tile editor
    self=this; 
    this.all_monitor_list.find().each(function(index, elem){elem.tile_editor=self});
    this.tile_monitor_list.find('li').each(function(index, elem){elem.tile_editor=self});
    //set up drag and drop
	$('.monitor_draggable').draggable({appendTo:'#tile_canvas_drop',connectToSortable:this.tile_monitor_list,helper:'clone',zIndex:9000,containment:'document',cursorAt:{left:5}});
	$('#tile_canvas_drop')[0].tile_editor=this;
    $('#tile_canvas_drop').monitor_droppable(this,false);
                    
    this.tile_monitor_list.children('li').monitor_droppable(this, true);         

    
    this.create_monitor_display=function(monitor_name, attrs, in_main_list){
    	var header=$("<h3 id='"+monitor_name+"' class='ui-widget' style='width:95%'><a href='#'>"+monitor_name+"</a></h3>");
        var attrs_display=$("<div id='"+monitor_name+"_attrs' style='min-height:100px'></div>");
        var html = 
  	   	   "     <ul style='min-height:200' calss='attr_checklist'>";
 		var count=0;
 		for (index in attrs){   
 			if (attrs[index]) checked_text="checked='true'";
 			else checked_text='';
 			html=html + "        <li class='ui-widget' style='list-style:none;padding:0;margin:0;'>"+
 			   "<input id='"+monitor_name + "." + index + "' attr='" + index + "'" +
 			        "class='attr_checkitem single_attr_checkitem' type='checkbox' "+checked_text +"></input>"+
 			   "<label>"+ index + "</label></li>"; 			
 			++count;
 		};
 	
 		html = html + 
 		   "     </ul>";    	
 		attrs_display.append($(html));
 		attrs_display.checklist();
 		if (in_main_list) {
 			header.addClass('monitor_draggable');
 		} else { 
 		   	attrs_display[0].tile_editor=this;
 	    	attrs_display.checklist("changed",function(input, checked){
 	    		var monitor_name=input.attr('id').split('.'); 	    		
 	    		var attrname=monitor_name[1];
 	    		monitor_name=monitor_name[0];
 	    		if (checked){
 	    			this.tile_editor.drawable.add_monitor(monitor_name, attrname);
 	    		} else {
 	    			this.tile_editor.drawable.remove_monitor(monitor_name, attrname);
 	    		}
 	    	});
 	    	
 		}
 		header[0].tile_editor=this;
 		var div=$('<div id="'+monitor_name+'_div" style="position:relative"></div>');
 		div.append(header);
 		div.append(attrs_display);
 		if(!in_main_list)
 			div.listremovable();
 		return {div: div, header:header, content: attrs_display};
    };
    
    /* 
     * Add a monitor to the tile monitor list before the given element.
     * If before_element is null, will simply append to the list.
     */
    this.add_monitor = function( monitor_name, attrs, before_element){    
    	//show items as inactive in main list
    	this.all_monitor_list.find('h3[id='+monitor_name+']').css('opacity','0.3');
    	this.all_monitor_list.find('div[id='+monitor_name+'_attrs]').css('display','none');
   	    	
    	//we must show the monitor list tab, otherwise the sizing of the accordion subelements will 
    	//display too small.  This is tricky, as we have to perform a callback if the monitor list 
    	//tab isn't shown, so that the monitor element is added only after the monitor list tab is shown
    	if(this.tabs.tabs("option","selected")!=0){
    		this.in_transition=true;
    	    self=this;
    		this.tabs.tabs({show:function(){self.add_monitor(monitor_name,attrs, before_element);
    		  }});
    		this.tabs.tabs("select",0);
    	    return;
    	}
    	this.tabs.tabs({select:null});
      
    	var monitor_element=this.create_monitor_display(monitor_name, attrs, false);
   	     //monitor_element.css('min-height',100);
	  	//this.tile_monitor_list.accordion("destroy");
	  	//change handler to setup display
  	    self=this;
  
  	    	
  	  	//now add the monitor_element at the right position in the dom tree
	  	if (before_element) {	
	  		monitor_element.header[0].tile_editor=this;
	  		monitor_element.header.monitor_droppable(this, true);         
  	 	  	parent=before_element.parent();
  	 	 	var index=before_element.index();
    	  	if (index==0){
    	  		parent.prepend(monitor_element.div);
    	  	} else {
    	  		var frontend=parent.children().slice(0,index);//each entry is 2 element: header and div
    	  		var backend=parent.children().slice(index);
    			var newdom=$.merge(frontend,monitor_element.div);
    			newdom=$.merge(newdom, backend);
    	  		//reconstruct the parent based on the new dom
    	  		parent.empty();
    	  		parent.append(newdom);
    	  	}
  	  	} else { //simply append to end
 	 	  	index=-1;
  	  		this.tile_monitor_list.append(monitor_element.div);
  	  		monitor_element.header[0].tile_editor=this;
  	  	    monitor_element.header.monitor_droppable(this, true);         
  	  	}
	  	
	   	monitor_element.content.find('input').each(function(attrindex,element){
	   		
	  		if(attrindex == 0) return;
 	  		monitor_name=monitor_element.header.attr('id');
 	  	    if ($(this).attr('checked'))	{
	  		   attrname=$(this).parent().text();
	  		   self.drawable.add_monitor( monitor_name,
	  				                      attrname,
	  				                      index);
	  	   }
	  	});
  	  	//re-establish accordion based on new dom
  	  	this.in_sort = false;
  	  	//this.tile_monitor_list.accordion();
  	  	//this.tile_monitor_list.accordion("resize");
        this.tile_monitor_list.sortable({
			axis: "y",
			handle: "h3"});
        
   	  	this.refresh();                    
    };
      
    /*
     * =========================
     * METHODS
     * =========================
     */
    
    /*
     * Refresh the monitors and monitor lists to provide proper user control
     * (accordion, etc.).  This is called when an element is added/removed from
     * the current monitor list to update operations for the new elements
     */
    this.refresh = function(){
    	
    	this.tile_monitor_list[0].tile_editor=this;
    	this.tile_monitor_list.accordion("destroy");
    	this.tile_monitor_list.accordion({header:"> div >h3",
    		collapsible:true, 
    		active:false,
    		change:function(){
    		if(this.tile_editor.in_sort) {
    			this.tile_editor.tile_monitor_list.accordion('activate',false);
    			this.tile_editor.in_sort=false;                                 
    		}
    	}}).sortable();
      	  
    };

        
   
    /*
     * Add a list of monitors to the global monitor list to make
     * them available as a selection choice to the user 
     * to add to the current tile
       */
    this.monitor_available = function(monitorlist){
    	//create a new element for the monitor
    	var html = "";
     	for (index in monitorlist){
    		var monitor_name=monitorlist[index].name;
    		var attrlist=monitorlist[index].attrs;
    		var monitor_element=this.create_monitor_display(monitor_name, attrlist, true);    		
    		var header=monitor_element.header;
    		var element=monitor_element.content;
    		switch (monitor_name[0]){
       		case 'a': case 'b': case 'c': case 'd': case 'e': case 'f':
    		case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
    			   $('#A_to_F_tab').append(monitor_element.div);
    			   break;
    		case 'g': case 'h': case 'i': case 'j': case 'k': case 'l': case 'm':
    		case 'G': case 'H': case 'I': case 'J': case 'K': case 'L': case 'M':
       		    $('#G_to_M_tab').append(monitor_element.div);
       		    			break;
    		case 'n': case 'o': case 'p': case 'q': case 'r': case 's':
    		case 'N': case 'O': case 'P': case 'Q': case 'R': case 'S':
    		    $('#N_to_S_tab').append(monitor_element.div);
    			break;
    		
    		};
    	}
 
    	$('.attr_checkitem').parent().css('list-style','none');
    	self=this;
    	$('.attr_checkitem').each(function(index, element){
    		element.tile_editor=self;
    	});
         //set up attribute list checkboxes so that the "All Attributes" check box functions
    	//as a user would expect
    	$('.attr_checklist').each(function(index, element){
    	    var chklist=this;
    		$(this).find('li').each(function(index,element){
    			var input=$(this).children('input');
    			input.each(function(item,element){
    				element.parent=chklist;
    				if ($(element).is('.global_attr_checkitem')){
    						$(element).change(selecte_all);
        			}
    			});
    		
    		});
    	});
    	
    	$('.monitor_list').accordion({header: "> div > h3",
    		active:false,collapsible:true
    	});
     	   
    	//this.tile_monitor_list.accordion({//header: "> div > h3",
    //		active:false,collapsible:true,change:function(event,ui){
    // 		ui.newContent.css('min-height',100);
    // 	}});
        $('.monitor_draggable').draggable({appendTo:'#tile_canvas_drop',connectToSortable: this.tile_monitor_list, helper:'clone',zIndex:9000,containment:'document',cursorAt:{left:5}});
     	this.refresh();
    };
    	
    /*
     * Remove a monitor from the current monitor list
     */
    this.remove_monitor = function(monitor_name){
    	this.drawable.remove_monitor(monitor_name);
    	var div=this.tile_monitor_list.children('div[id='+monitor_name+'_div]');
    	div.remove();
 	
    	header=this.all_monitor_list.find('h3[id='+ monitor_name+']');
    	header.css('opacity',1.0);
        header.addClass('monitor_draggable');
       	var attrs_div=this.all_monitor_list.find('div[id='+monitor_name+'_attrs]');
        attrs_div.css('opacity',1.0);
        attrs_div.css('display','block');
        attrs_div.children('ul').css('display','block');
        attrs_div.css('display','none');
        this.tile_monitor_list.sortable({
			axis: "y",
			handle: "h3"});
    };
    
    this.properties_interface=function(){
    	return this.drawable.properties_interface();
    };
    
    this.commit_properties_changes = function(){
    	var data={};
    	var displayattrs=this.drawable.display_attributes();
    	if (displayattrs) {
    		for (index in displayattrs){//make a copy
    			data[index]=displayattrs[index];
    		}
    		this._invoke_server_action( "update_display_properties",data, "updating display properties", 
    			function(tile_editor){//onsuccess
    	   			tile_editor.restore();    	       				
    			},
    			function(tile_editor){//onerror
    				alert("Error commiting display property updates.");
    			}    			
    		);
    	}
    };
    
   
    this.cancel_changes=function(){
    	if(confirm("This will discard all changes made during this tile editing session"))
    		this.restore();
    };
    
    this.restore=function(){
    	//restore tile back to main display
    	this.canvas.remove();
    	this.parent.append(this.canvas);
    	$('#shadowbox').css('display','none');
    	$('#shadowbox').parent().css('display','none');
 	    $('#main_tile_editor').animate({opacity:0.0},1000,function(){$('#main_tile_editor').css('display','none');});
        $('#root').animate({left:0,top:0,opacity:1.0},1000);
      	$('#tile_editor_frame').css('display','none');
        visualization_controller.refresh();
    };
    
    this.rendevous_on_commit= function(success,html){
    	++this.commit_count;
    	if(!success){
    		++this.error_count;
    	}
    	if (this.commit_count==this.target_count){
    		if(this.error_count>0)
    			alert("Error committing updated monitor list.")
    		else {
    			this.commit_properties_changes();
    		}
    	}
    }
    
    this.commit_changes=function(monitors, index){
    	var count=0;
    	for (id in this.drawable.get_monitor_list().monitors) ++count;
    	this.target_count=count;
    	this.commit_count=0;
    	this.error_count=0;
    	list=this.drawable.get_monitor_list().monitors;
    	monitor_index=0;
    	var data={};
    	for (monitor_name in list){
    	  	//data['monitor']=monitor_name;
           	//data['monitor_index']=monitor_index++;
            for (attr in list[monitor_name]){
            	if (list[monitor_name][attr]) {
            		data[monitor_name+"__"+attr]=monitor_name+"."+ attr;	    		
            	}
            }
    		
    	}
    	this._invoke_server_action( "set_monitors",data, "adding monitor", 
				function(tile_editor){  //on success
		    		tile_editor.commit_properties_changes();
				},
				function(tile_editor){ //on error
					alert("Failed to commit changes.");
				}
    	);
    	
    };
    
    /* private method like _invoke_tile_action, but which redraws the whole display upon invocation*/
    this._invoke_server_action = function( action, data , description, onsuccess, onerror){
      document.body.style.cursor = 'progresss';
      
      var selcted_tab=calypso.tlm.selected_tab;//$('#tabbed_display').tabs("option","selected");      
      var tabindex=$('#tabbed_display').tabs("option","selected");
      var tabname=$('#tlm_tabs').children('li')[tabindex].id.replace("_tab",'');
      data['display']=calypso.tlm.session_configuration.display;
      data['configuration']=calypso.tlm.session_configuration.configuration;
      data['scenario']=calypso.tlm.session_configuration.scenario;
      data['x_pos']=this.tile_position.x_pos;
      data['y_pos']=this.tile_position.y_pos;
      data['tab']=tabname;
      try {
        $.ajax({url: "/TileProperties/"+action,
  		 data : (data),
         tile_editor:this,
  		 error : function(){
  		     document.body.style.cursor = 'auto';
  		     if(onerror) onerror(this.tile_editor);
  	       },
  	     success : function(){    
  	    	   
  		     visualization_controller.set_up_drag_and_drop();
   		     document.body.style.cursor = 'auto';
   		     if(onsuccess) onsuccess(this.tile_editor);
  	       }
  	     });
      } catch (e) {
        alert("EXCEPTION while " + description + ": " + e);
      }
    }

};

