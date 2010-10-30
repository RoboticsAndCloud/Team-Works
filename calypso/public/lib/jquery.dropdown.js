/* ============================================
   EXTENSIONS 
   ===========================================*/
/*
 * jQuery (http://jqueryui.com/about) extension : Menu Bar
 *
 * Copyright 2010, John  Rusnak,  
 * Licensed under the  GPL Version 2 license.
 *
 */

/* Add a menubar function to $.  Currently, takes no parameters.
 * The target jQuery element will be converted into a single-line menu bar
 * which will expand menus (and recursively, submenus) as the user hovers over the elements.
 * The HTML format will look like:
 * <div> #main element upon which $(element).menubar is invoked
 *   <div> #each menu list is placed in its own div
       <li>Main Menu 1</li>  #the title displayed for the first menu button along the main menu bar
       <ul>  
            <li><a href="#">Menu Item 1</a></li>
	        <li><a href="#">Menu Item 2</a></li>
	        ...
	    </ul>
     </div>
     <div> 
        <li>Main menu item 2</li> #Title for main menubar button 2
        <ul>
          <li><a href="#">Menu 2 Item 1</a></li>
 	      <li><a href="#">Menu 2 Item 2</a></li> 	        
            <div>
               <li>Heading to Invoke Submenu
               <ul>
                 <li><a href="#">Submenu Item 1</a></li>
                     ...
               </ul>
            </div>
          </li>            
 	    </ul>
     </div>
 */
jQuery.fn.menubar=function(){
	
	  //set up display.  Only show first level menu items
	  this.children('div').css('display','block');
	  this.find('a').css('text-decoration','none');
	  this.find('ul').css('display','none');
	  this.find('ul').find('li').addClass('ui-menu-item');
	  this.find('ul').find('li').css('display','block');
	  this.find('ul').addClass('ui-menu-list ui-state-default');
  	
	  this.submenu = function(menu){
  	      $(menu).addClass('ui-menu ui-state-default ui-corner-top');
  	      //top level list items are the menu buttons (or submenu items)
	      $(menu).children('li').addClass('ui-menu-button');
	
	      //only on hover, display any submenus
	      $(menu).hover(
	         function(){//handlerIn
	       	    $(this).children('li').addClass('ui-menu-selected ui-state-active');
	    	    $(this).children('ul').css('display','block');
		     },
	        function(){//handlerOut
			    $(this).children('li').removeClass('ui-menu-selected ui-state-active');
			    $(this).find('ul').css('display','none');
	 	    }
		  );
	      //recurse for lower level menus, if any
	      self=this;
	      $(menu).children('ul').children('div').each(function(index,submenu){
	     	  self.submenu($(submenu));
	     	  //submenu list items should appear as regular list items:
	     	  $(this).children('li').removeClass('ui-menu-button');
	     	  $(this).children('li').append($('<b class="ui-submenu-icon">></b>'));
	     	  $(this).children('li').addClass('ui-submenu-item');
	     	  $(this).addClass('ui-submenu');
	     	          });
	  };
	  
	  self=this;
	  this.children('div').each(function(index, menu){
		  self.submenu($(menu));
	  });
  
};