
function RoutingClass(){
  this.url_for=function(scenario, action){
    if (action == 'load') then{
      return '/Scenario/load/'+scenario+'/1';
    } else if (action=='pause' ) {
      return '/Scenario/pause/'+scenario+'/1';      
    }
    } else if (action=='start' ) {
      return '/Scenario/start/'+scenario+'/1';
    }
    } else if (action=='stop' ) {
      return '$/Scenario/stop/'+scenario+'/1';
    }
    } else if (action=='resume' ) {
      return '/Scenario/resume/'+scenario+'/1';
    }
  }
}

Routing = RoutingClass();
