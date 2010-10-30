jQuery.fn.menubar=function(){
	
	  this.children('div').css('display','block');

	  this.submenu = function(menu){
		$(menu).addClass('ui-menu ui-state-default ui-corner-top');
	    $(menu).children('h3').addClass('ui-menu-button');
	    $(menu).find('a').css('text-decoration','none');
	    menulist=$(menu).find('ul');
	    menulist.css('display','none');
	    $(menu).find('li').css('display','block');

	    $(menu).find('ul').find('li').addClass('ui-menu-item');
	    $(menu).find('ul').addClass('ui-menu-list ui-state-default');
	  
	    $(menu).hover(
	      function(){//handlerIn
	    	  $(this).children('h3').addClass('ui-menu-selected ui-state-active');
	      	  $(this).children('li').addClass('ui-menu-button-selected ui-state-hover');
		      $(this).find('ul').css('display','block');
		  },
	      function(){//handlerOut
			  $(this).children('h3').removeClass('ui-menu-selected ui-state-active');
			  $(this).find('ul').css('display','none');
	 	 	  $(this).children('li').removeClass('ui-menu-button-selected ui-state-hover');
		 });
	    //recurse for lower level menus, if any
	    $(menu).find('ul').children('div').each(function(index,menu){this.submenu($menu);});
	  };
	    
	  this.children('div').each(function(index, menu){
		  this.submenu($(menu));
	  });
  
};