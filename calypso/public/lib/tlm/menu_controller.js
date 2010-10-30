

/**
 * Class for controlling the overall menu (for save, delete and exit operations)
 */
Menu_Controller = function(menu_bar, vis_controller){
  this.vis_controller = vis_controller;
  this.display=vis_controller.display;
  this.configuration= vis_controller.configuration;
  this.scenario = vis_controller.scenario;
  this.name_query = $('#name_query');
  $(menu_bar).menubar();
     

  /**
   * save the current display under a new name (from a separate user query)
   */
  this.save_display_as = function(){
      $('.menu').css('display','none');
      this.name_query.css('display','inline');
    }

  /**
   * Save the display (althought this is really done for free on each update)
   */
  this.save_display = function(){
  
	  this.vis_controller._invoke_display_action("save",{}, "saving display", $('#main_display'),
			                                     function(){alert("Display successfully saved");});
        $('.menu').css('display','none');

  };

  
  this.setmenutimeout = function(){
   
  };
  
  /**
   * Upon user entry of a new name for the current display, submit it to the server
   */
  this.submit_rename = function(name){
    this.name_query.css('display','none');
    document.body.style.cursor = 'progress'; 
    data = {configuration:this.configuration,
	    scenario:this.scenario,
	    tab : $('.selectedtab')[0].id.replace('_tab',''),
	    newname: name};
    $.ajax({
      url:'/Visualization/copy_to',
	  data:(data),
	  error : function(){alert("ERROR in saving display "+data.newname);	document.body.style.cursor = 'auto'; },
	  success:function(js){
	    eval(js);
	    document.body.style.cursor = 'auto';	 
	    window.location="/Visualization/edit?configuration="+data.configuration+"&scenario="+data.scenario+"&display="+data.newname;
	}
	
      }); 
    return false;//do not reload or redirect page
    };
  
  
  this.delete_display = function(){
    if (confirm("Really delete all content in this display?")){
      
      this.name_query.css('display','none');
      document.body.style.cursor = 'progress'; 
      data = {configuration:this.configuration,
	      scenario:this.scenario,
	      tab : $('.selectedtab')[0].id.replace('_tab',''),
	      newname: name};
      $.ajax({
	url:'/Visualization/delete',
	    data:(data),
	    error : function(){alert("ERROR in deleting display "+this.display);	document.body.style.cursor = 'auto'; },
	    success:function(js){
	    eval(js);
	    document.body.style.cursor = 'auto';	 
	    window.location="/Visualization/edit?configuration="+data.configuration+"&scenario="+data.scenario+"&display=unnamed";
	  }
	  	
      }); 
    }
    return false;//do not reload or redirect page
  };

  this.new_display=function(){
    window.location="/Visualization/edit?configuration="+data.configuration+"&scenario="+data.scenario+"&display=unnamed";    
  };

}
  
menu_controller=null;
