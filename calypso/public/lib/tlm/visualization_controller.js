
/**
 * Class representing a proxy for invoking controller actions on the server side.  Each method
 * typically invokes and AJAX call to the server and acts on a response.
 */
Visualization_Controller_Proxy=function( display, configuration, scenario){

  this.display=display;
  this.configuration=configuration;
  this.scenario=scenario;

  /**
   * activate method for invoking an AJAX action on the Display controller on the server side
   * @action => the (string) action to be performed, which must be a python method of a controller under Pylons
   * @data => action-specific data to be sent as parameters to AJAX;  note that this procedure will handle setting
   *          globasl such as configuration and scenario information
   * @onelem => the HTML element to be acted upon return from the AJAX call (if null, the action will be
   *             applied to the main telemetry display in total)
   * @addl_reponse => a callback function invoked if the AJAX call is successful and the response successfully 
   *                  applied
   */
  this._invoke_display_action = function( action, data , description, onelem, addl_response){
    //we're working on it...
    document.body.style.cursor = 'progress';
	
    //set up the standard elements of request data
	if (!data) data={};
	data['display']=this.display;
    data['configuration']=this.configuration;
    data['scenario']=this.scenario;
    if (!data['tab']){
           tabindex=$('#tabbed_display').tabs("option","selected");
           data['tab']=$($('#tlm_tabs').find('li')[tabindex]).attr('name');
    }
    //make a call to the server and redraw the main display window with the response
    try{
      $.ajax({url: "/Visualization/" + action,
		 data : (data),
		 error : function(){
		     alert("ERROR " + description);
		     document.body.style.cursor = 'auto';
	       },
		 success : function(html){ 
	       if (!onelem){
	    	   $('#main_display').html(html);
		       visualization_controller.set_up_drag_and_drop();	
			     document.body.style.cursor = 'auto';
				 
	       }
		   else {		
			   try{
		     onelem.html(html);
			   }catch(e){}
		   }
		   if (addl_response) try{addl_response()}catch(e){alert("ERROR " + description);}
		   document.body.style.cursor = 'auto';
		   this.inprogress=false;
	     }
	       
	   });
    } catch (e) {
      alert("ERROR  " + description + ": " + e);
    }
  };
 
  


  /**
   * Display the selected tab
   */
  this.select_tab = function(tabname){
    data={tab:tabname};
    this._invoke_display_action("select_tab",data, "selecting tab", null);
    
  };


  /**
   * Add a new tab with a default assigned name to the display
   */
  this.add_new_tab = function(){
      this._invoke_display_action( "add_new_tab",{}, "adding new tab", null);
  };


  /**
   * remove a tab of the given name from the display
   */
  this.remove_tab = function(tabname){
    data={tab:tabname};
    this._invoke_display_action("remove_tab", data, "removing tab " + tabname, null);
  };



  /**
   * Rename the currently selected tab within the display
   */
  this.rename_window = function(name){
    if (name=='' || name==null){ 
      alert("Name cannot be empty");
    } else {
      this._invoke_display_action("rename_tab",{name:name},"renaming tab.  Name must be unique and non-empty", null);
    }
  };


  /**
   * Add a tile to the display of a given type and at a given row, col position
   * @param position    values {x_pos,y_pos} indicating the row and column respectively, indexed starting at 0
   */
  this.append_tile = function(type,visualization, position){
	  tabname=this.selected_tabname();
	  tab=$('#tab_'+tabname);
	  drawable=tab.find('td[x_pos='+position.x_pos+'][y_pos='+position.y_pos+']').children('div');	  
	  drawable[0].drawable=new visualization(drawable,"",{});
	  drawable[0].drawable.draw_chart();
	  data={x_pos : position.x_pos,
			y_pos : position.y_pos,
            type : type};
     this._invoke_display_action( "append_tile", data,  "adding tile" ); 
   
  };



  /**
   * Remove a tile at the given row/column 
   * @param  position   an array indexed on strings x_pos and y_pos indicating the row number anc
   * column number, respectively 
   */
  this.remove_tile = function(position){
    data = {x_pos: position.x_pos, 
    		y_pos: position.y_pos};
    
    this._invoke_display_action("remove_tile", data, "removing tile"); 
    if (element)
      element.css('background-color','transparent');
  
  };


  this.save_as=function(name, callback){
  	data={newname:name};
  	this._invoke_display_action("set_name",data,"Saving",true, callback);
  };
  
  /**
   * Move a tile from one x_pos, y_pos (row, column) position to another
   */
  this.move_tile = function( from_position, to_position){
	     document.body.style.cursor = 'progress';
		 
	  if ((from_position.x_pos == to_position.x_pos) && (to_position.y_pos==from_position.y_pos))
		  return;
	  data={ to_x_pos : to_position.x_pos,
   		     to_y_pos : to_position.y_pos,
	         from_x_pos : from_position.x_pos,
             from_y_pos : from_position.y_pos};
	  this._invoke_display_action(   "move_tile", data, "moving tile");
    };

    this.selected_tabname=function(){
    	tabindex=$('#tabbed_display').tabs("option","selected");
    	return $('#tlm_tabs').children('li')[tabindex].id.replace("_tab",'');
     };
        
    this._invoke_tile_action = function( action, x_pos, y_pos, data , description, onsuccess, onerror){
      document.body.style.cursor = 'progresss';
      tabname=this.selected_tabname();
      data['display']=calypso.tlm.session_configuration.display;
      data['configuration']=calypso.tlm.session_configuration.configuration;
      data['scenario']=calypso.tlm.session_configuration.scenario;
      data['x_pos']=x_pos;
      data['y_pos']=y_pos;
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
  	    	   document.body.style.cursor = 'auto';
  	    	   visualization_controller.set_up_drag_and_drop();
   		       if(onsuccess) onsuccess(this.tile_editor);
  	       }
  	     });
      } catch (e) {
        alert("EXCEPTION while " + description + ": " + e);
      }
    };
    
  this.refresh=function(){
      if (!calypso.tlm.windows) calypso.tlm.windows={}
      calypso.tlm.windows={};
       this._invoke_display_action("display",{},"refreshing display", null);

  };
  
  this.reduce_tile_colspan=function(x_pos, y_pos){	 
	  data={col_span:"-=1"};
	  tabname=this.selected_tabname();
	  td=$('#tab_'+tabname).find('td[x_pos='+x_pos+'][y_pos='+y_pos+']');
	  span=td.attr('colspan');
	  if (span > 1){
		  td.attr('colspan',span-1);
		  this._invoke_tile_action("update_display_properties",x_pos, y_pos,
				  data,"updating tile column span",
				  function(){},
				  function(){alert("Error committing tile changes."); 
				     //undo
	              	 td=$('#tab_'+tabname).find('td[x_pos='+x_pos+'][y_pos='+y_pos+']');
	               	 span=td.attr('colspan');
	               	 td.attr('colspan',span+1); 
	               	 $('#'+tabname+"_spanner_"+x_pos + "_"+y_pos).html("span:"+(span+1));
				  });
		  $('#'+tabname+"_spanner_"+x_pos + "_"+y_pos).html("span:"+(span-1));
		     //		  this.refresh();
	  }
  };
  
  this.expand_tile_colspan=function(x_pos, y_pos){	 
	  data={col_span:"+=1"};
      this._invoke_tile_action("update_display_properties",x_pos, y_pos,
               data,"updating tile column span",
               function(){},
               function(){alert("Error committing tile changes.");
                 //undo
               	 td=$('#tab_'+tabname).find('td[x_pos='+x_pos+'][y_pos='+y_pos+']');
               	 span=td.attr('colspan');
               	 td.attr('colspan',span-1);
                 $('#'+tabname+"_spanner_"+x_pos + "_"+y_pos).html("span:"+(span-1));
          
               });
      tabname=this.selected_tabname();
	  td=$('#tab_'+tabname).find('td[x_pos='+x_pos+'][y_pos='+y_pos+']');
	  span=td.attr('colspan');
      td.attr('colspan',span+1);
      $('#'+tabname+"_spanner_"+x_pos + "_"+y_pos).html("span:"+(span+1));
      //this.refresh();
  };
  
  /**
   * Set up all drag and drop capabilities on the display.  This must 
   * be called on each refresh via an AJAX call to ensure newly created
   * elements participate
   */
  this.set_up_drag_and_drop = function(){
    //clear out the old (may not really be necessary)
    $(".tile_draggable, .monitor_droppable").draggable("destroy");
    $(".tile_receiver").droppable("destroy");
    $(".monitor_droppable").droppable("destroy");
    $(".sizer").resizable("destroy");
    
    self=this;
    $(".sizer").each(function(){
    	this.controller=self;
    	id=$(this).attr('id').replace('_sizer','');
    	this.referedFrom=$('#'+id+'_container');    	
    });
    $(".sizer").resizable({ 
    	start:function(event, ui){
    		if (this.drawable.hide_on_resize){
    			$(this).children().css('display','none');
    			$(this).css('border','dashed 1px black');
    		    		}
  			//$(this).css('position','static');
  		},
    	resize:function(event,ui){
  		//    $(this).css('position','static');
  		  		  
    		var padding=this.drawable.padding?this.drawable.padding:0;
    		this.drawable.displayattrs['width']=ui.size.width-padding;
    		this.drawable.displayattrs['height']=ui.size.height-padding;
    		$(this).parent().css('height',ui.size.height+10);
    		$(this).parent().css('width',ui.size.width+10);
    		if (!this.drawable.hide_on_resize){
    		    	this.drawable.draw_chart(); 	   
    		}
       },
       stop: function(event, ui) { 
    	    //$(this).css('position','absolute');
      		
    	   document.body.style.cursor = 'progresss';
    	   if(this.drawable.hide_on_resize){
    	    	$(this).children().css('display','block');
    	    	$(this).css('border','none');
    	    }
            var parent=$(this).parent();
            var position={x_pos:parent.attr('x_pos'), y_pos:parent.attr('y_pos')};
            var data={};
            data['width']=ui.size.width;
            data['height']=ui.size.height;
            this.controller._invoke_tile_action("update_display_properties",position.x_pos, position.y_pos,
         		                       data,"updating tile width and height",
         		                       function(){},
         		   function(){alert("Error commiting tile changes.")});
    		var padding=this.drawable.padding?this.drawable.padding:0;
    	    this.drawable.displayattrs['width']=ui.size.width-padding;
            this.drawable.displayattrs['height']=ui.size.height-padding;
            $(this).parent().css('height',ui.size.height+10);
            $(this).parent().css('width', ui.size.width+10);
            $(this).css('height',ui.size.height+10);
            $(this).css('width',ui.size.width+10);
       
             this.drawable.draw_chart();
             document.body.style.cursor = 'auto'; 
      }  
  
    });
    
    
    //establish drag/drop for tiles within the display
    $(".tile_draggable").draggable({
          helper:'clone',
	      start: function(event, ui) {$('.tile_receiver_img').css('display','inline');$('.empty_tile_receiver').css('opacity',1.0); },
	      stop: function(event, ui) {$('.tile_receiver_img').css('display','none'); $('.empty_tile_receiver').css('opacity',0.3);},
	      cursorAt:{ left: 5 },
	      zIndex:2600}); 
    $(".empty_tile_draggable").draggable({
     	  appendTo:'body',
          helper:function(){elem= $('#'+$(this).attr('tileclass')).clone(); elem.attr('zIndex',2000);return elem;},
	      start: function(event, ui) {$('.empty_tile_receiver').css('opacity',1.0); },
	      stop: function(event, ui) {$('.empty_tile_receiver').css('opacity',0.3); },
	      cursorAt:{ left: 5 },
	      zIndex:2600}); 
    $(".tile_receiver").droppable({ 
        hover : 'tile_receiver_hovered',
        accept:'.tile_draggable',
  	  drop: function(event, ui) { 	     document.body.style.cursor = 'progress';
 	 
            from_position= {x_pos:ui.draggable.attr('x_pos'),
          		          y_pos:ui.draggable.attr('y_pos')};
  	      //moving tile to another position:
  	      to_position={x_pos: $(this).attr('x_pos'),
  	    		       y_pos: $(this).attr('y_pos')};
  	      visualization_controller.move_tile(from_position, to_position);
  	   
  	    }
        });
    
 
    $(".empty_tile_receiver").droppable({ 
      hover : 'tile_receiver_hovered',
      accept:'.tile_draggable, .empty_tile_draggable',
	  drop: function(event, ui) { 
    	to_position={x_pos: $(this).attr('x_pos'),
    			     y_pos: $(this).attr('y_pos')};
	
      if (ui.draggable.is('.tile_draggable')){
            //moving tile to another position:
            from_position= {x_pos:ui.draggable.attr('x_pos'),
	                       y_pos:ui.draggable.attr('y_pos')};
          visualization_controller.move_tile(from_position, to_position);
      } else {
    	  classname=ui.draggable.attr('tileclass');
    	  visualization=get_visualization_class(classname);
          visualization_controller.append_tile(ui.draggable.attr('id'),
        		  							   visualization,
        		  							   to_position);
      }
      
        }	
     });
    
    //setup drag operations for dragging monitors
    $(".monitor_draggable").draggable({helper:'clone', cursorAt:{ left: 5 }});
    $(".monitor_draggable").draggable("option",'cursor',"move");
   
  };
  
  //initializer: initializes drag & drop upon creation of the controller object
  this.set_up_drag_and_drop();

}


visualization_controller=null;