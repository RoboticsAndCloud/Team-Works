////////
//Class for logging to display
////////
function Logger(writearea){
  this.writearea=writearea;
  
  this.log = function(statement, criticality){
    time=(new Date()).toUTCString();
    color=CRITCOLORS[criticality];
    if (criticality==NOMINAL) color='lightyellow';
    if (writearea!=null)
      {
	writearea.innerHTML += "<p style='padding:0;margin:0;'>"+
	  "<strong style=background-color:"+color+">["+
	  time +"]</strong>&nbsp;"+statement+ "</p>";
      }
    //if too many msgs on screen, remove first one
    children=writearea.getElementsByTagName('p');
    if (children.length> MAX_LOG_MSGS)
      {
	writearea.removeChild(children[0]);
      }
      with (document.getElementById('PHPhidden')){
	src='savelog.php?action=add&color='+color+
        '&time='+time+'&text='+statement +'&asset='+asset;
      };    
  };

  this.clear = function(confrm){
    if (confrm==true && confirm('Clear all statements without saving?'))
      {
	writearea.innerHTML='';
	with (document.getElementById('PHP')){
	  src='savelog.php?asset='+asset+'&action=clear';
	  style.visibility='hidden';
	};
      }
 }

  this.save = function(){
    with (document.getElementById('PHP')){
      src='savelog.php?asset='+asset+'&action=save';
      style.visibility='visible';
    };
    writearea.innerHTML='';
  };

  this.view = function(logid){
    window.location='savelog.php?asset='+asset+'&action=view&identifier='+logid;
  
    
  };
}
