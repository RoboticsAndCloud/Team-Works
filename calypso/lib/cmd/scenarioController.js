function ScenarioController(scenario){

  this.starturl = Routing.url_for(scenario,'start');
  this.stopurl = Routing.url_for(scneario,'stop');
  this.pauseurl = Routing.url_for(scenario,'pause');
  this.resumeurl = Routing.url_for(scenario,'resume');

  this.start = function(){
    $.ajax({ url: starturl,
	       type: 'POST',
	       error(text){
	       alert('ERROR: ' + text);
	     }
	   });
  }

  
}
