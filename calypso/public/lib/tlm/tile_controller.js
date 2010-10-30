


/**
 * Class representing a proxy javascript interface to the server.  Methods wil
 * typically invoke AJAX calls to the server and redraw necessary elements via
 * the response.
 */
Tile_Properties_Controller_Proxy= function( x_pos, y_pos){
	
  this.position={x_pos: x_pos, y_pos: y_pos};
  this.display = visualization_controller.display;
  this.configuration = visualization_controller.configuration;
  this.scenario = visualization_controller.scenario;
  this.display_cell=null;
  
  /**
   * @private method to invoke an action via the Tile Properties controller
   * on the server side
   */
  this._invoke_tile_action = function( target, action, data , description, addl_response){

	document.body.style.cursor = 'progress';
	//set up global data parameters to be passed during AJAX call
    if(!data) data={};
    data['display']=visualization_controller.display;
    data['configuration']=this.configuration;
    data['scenario']=this.scenario;
    data['x_pos']=this.position.x_pos;
    data['y_pos']=this.position.y_pos;
    data['tab']=selected_tab;
    
    //invoke the action on the controller on the server side
    try {
      $.ajax({url: "/TileProperties/"+action,
		     data : (data),
             tile:this,
		     error : function(){
		          alert("ERROR while " + description);
	   	          document.body.style.cursor = 'auto';
	         },
	         success : function(html){  
	            target.html(html);
	             visualization_controller.set_up_drag_and_drop();
 		        if (addl_response) try{addl_response()}catch(e){alert("EXCEPTION : " + description + ": " + e);}
		        document.body.style.cursor = 'auto';
	            }
	         });
    } catch (e) {
      alert("EXCEPTION while " + description + ": " + e);
    }
  };
  
  

  /* private method like _invoke_tile_action, but which redraws the whole display upon invocation*/
  this._invoke_display_action = function( action, data , description, onelem,addl_response){
    document.body.style.cursor = 'progresss';
    data['display']=visualization_controller.display;
    data['configuration']=this.configuration;
    data['scenario']=this.scenario;
    data['x_pos']=this.position.x_pos;
    data['y_pos']=this.position.y_pos;
    data['tab']=selected_tab;
    try {
      $.ajax({url: "/TileProperties/"+action,
		 data : (data),
                 tile:this,
		 error : function(){
		 alert("ERROR while " + description);
		 document.body.style.cursor = 'auto';
	       },
	      success : function(html){  
		 if (!onelem)
		   $('#main_display').html(html);
		 else{
			 if (this.display_cell)
				 this.display_cell.html(html);
			 else {
    		   elem.html(html);
			 }
		 }
		 visualization_controller.set_up_drag_and_drop();
 		 if (addl_response) try{addl_response()}catch(e){alert("EXCEPTION while  : " + description);}
		 document.body.style.cursor = 'auto';
	       }
	     });
    } catch (e) {
      alert("EXCEPTION while " + description + ": " + e);
    }
  }


  
  /**
   * expand the associated tile to cover an additional row
   */
  this.expand_tilerowspan = function(){
    this._invoke_dispay_tile_action("increment_rowspan", {}, "incrementing row span"); 
  };

  
  /**
   * If greater than a single row, reduce the number of rows spanned by this
   * tile by 1
   */
  this.reduce_tilerowspan = function(){
    this._invoke_display_action("decrement_rowspan", {}, "incrementing row span"); 
  };

  
  /**
   * Epxand the tile to occupy an additional column
   */
  this.expand_tilecolspan = function(){
    this._invoke_display_action("increment_colspan", {}, "incrementing row span"); 
  };

  /**
   * Reduce the number of columns occupied by this tile, provided it is greater
   * than 1 (do nothing otherwise)
   */
  this.reduce_tilecolspan = function(){
    this._invoke_display_action("decrement_colspan", {}, "incrementing row span");     
  };

  /**
   * Add a monitor for display within this tile
   */
  this.append_monitor = function(tileelem, monitorname, data){
    data['monitor']=monitorname;
    data['nameprefix']='Editor_';
     
    this._invoke_tile_action(tileelem, "append_monitor",data, "appending monitor" ,
 		   function(){
    calypso.tlm.tile_editor.tilecontroller=calypso.tlm.tile_editor.tilecontroller.clone($('#tile_editor_cell'));
    calypso.tlm.tile_editor.tilecontroller.draw();
    });
      
  }

  
  /**
   * Update the basic properties of the tile (name, col & row span, etc.).
   * Data is gathered form the GUI properties menu elements to send to the server.
   */
  this.update_tile_basic_properties = function(tileelem, data){
    if (!data || data.length == 0){
      $.each($('.tile_basic_property'),function(index,elem){ if ( elem ){
		 if (elem.type=='checkbox') data['property:'+elem.id]=elem.checked;
		 else
		   data[elem.id]=elem.value; }
	     }); 
    }
    this._invoke_tile_action( tileelem,"set_basic_properties",data, "updating tile properties" );
    return false;//do not relocate/reload window, AJAX  and js handles updates for us
  };


  /**
   * update the tile properties (non-basic -- those associated with the specific
   * type of tyle), based on menu inputs from user
   */
  this.update_tile_properties = function(tileelem, form){
	  data={no_operations:true};
	$.each(form.contents().find('.tile_basic_property'),function(index,elem){ if ( elem){
		if (elem.type=='checkbox') data['property:'+elem.id]=elem.checked;
		else
			data['property:' +elem.id]=elem.value; }
	}); 
	this._invoke_tile_action( tileelem, "set_basic_properties", data, "setting basic tile properteis", null);
	data={no_operations:true};
	$.each(form.contents().find('.tile_property'),function(index,elem){ if ( elem){
		if (elem.type=='checkbox')
                    data['property:'+elem.id]=elem.checked;
		else
		    data['property:' +elem.id]=elem.value; 
             }
	}); 
	this._invoke_tile_action( tileelem, "set_properties", data, "setting tile properteis" ,
	 		   function(){
	    calypso.tlm.tile_editor.tilecontroller=calypso.tlm.tile_editor.tilecontroller.clone($('#tile_editor_cell'));
	    calypso.tlm.tile_editor.tilecontroller.draw();
	    });
	return false;//do not relocate/reload window, AJAX  and js handles updates for us
  };


  
  /**
   * update the monitor attributes associated with this tile.  This includes
   * adding or removing attributes associated with the given monitor
   */
  this.update_monitor_attrs = function( tileelem,  monitor, data){
    data['monitorname']=monitor;
    data['nameprefix']='Editor_';
    this._invoke_tile_action(tileelem, "update_monitor_attrs", data, "updating monitor attributes" ,
  		   function(){
        calypso.tlm.tile_editor.tilecontroller=calypso.tlm.tile_editor.tilecontroller.clone($('#tile_editor_cell'));
        calypso.tlm.tile_editor.tilecontroller.draw();
        });
  };

  
  /**
   * Remove a monitor from this tile
   */
  this.remove_monitor = function( tileelem, monitor){
    data={monitorname: monitor};
    data['nameprefix']='Editor_';    
    this._invoke_tile_action(tileelem,"remove_monitor", data, "removing monitor" ,
  		   function(){
        calypso.tlm.tile_editor.tilecontroller=calypso.tlm.tile_editor.tilecontroller.clone($('#tile_editor_cell'));
        calypso.tlm.tile_editor.tilecontroller.draw();
        });
  };

  /**
   * Display a monitor (add it) to this tile
   */
  this.display_monitor = function (tileelem,monitorname){
    data={monitorname: monitorname}; 
    this._invoke_tile_action(tileelem, "display_monitor", data, "displaying monitor", $('#monitor_selection_menu'),null);
  };
  
  /**
   * Display/redrar this tile
   */
  this.display = function(tileelem){
	  data={nameprefix:'Editor_'};
	  this._invoke_tile_action(tileelem, "display", data, "displaying tile");
   };
};

tile_controllers = new Array();
