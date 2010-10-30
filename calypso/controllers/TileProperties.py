from calypso import session as calypso_session
import logging
import sys
import os

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from routes import url_for as url_for
from calypso.lib.base import BaseController, render

log = logging.getLogger(__name__)

from calypso.model.meta import Session as sqlsession
from calypso.tlm.view import *
from calypso.tlm import *
import calypso
from pylons import session

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))+'/scenarios')
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))+'/scenarios/'+sys.argv[1]+'/lib')

import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from calypso.lib.base import BaseController, render

log = logging.getLogger(__name__)

from calypso.controllers.Visualization import VisualizationController as VisualizationController;

#inheritance from main controller is here only to prevent multiple controller threads from ajax calls;  such a case
#would impair ability to work with db
class TilepropertiesController(VisualizationController):

    def __init__( self):
        VisualizationController.__init__(self)
        
        c.configuration=request.params['configuration']
        c.scenario=request.params['scenario']
        c.selected=request.params['tab']
        c.x_pos=int(request.params['x_pos'])
        c.y_pos=int(request.params['y_pos'])
        self.x_pos=c.x_pos
        self.y_pos=c.y_pos
        self.scenario=c.scenario
        self.configuration=c.configuration
    
        
    def __before__(self, action):
        try:
            BaseController.__before__(self, action)
            c.display = calypso_session[self.user]['display']
            c.tabs = c.display.tabs
            c.tab = c.selected
            c.window  = c.display.get_window(c.selected)
            self.tile=c.window.tiles[c.y_pos][c.x_pos]
            self.tab=c.selected
        except:
            print "REQUEST PARAMS ARE:"
            print request.params
            raise

    def display(self):
         return self.tile.tile.render_html(self.tile.properties)
    
    def rename(self):
        newname=request.params['newname']
        self.tile.tile.set_name(newname)
        return render('/tlm/develop/Visualization-main.html')

    def set_properties(self):
        for propname,value in request.params.iteritems():
            key=propname.replace('property:','')
            if propname.startswith('property:'):
                self.tile.properties.params[key].set_value(value)
        return self.display()
         
    def _remove_monitor(self, configuration, scenario, display, tab, x_pos, y_pos, monitorname):
        self.tile.tile.remove_monitor(monitorname)
        return self.display()
    
    
    def _update_display_properties(self, configuration, scenario, display, tab, x_pos, y_pos,**kargs):
        for key,value in kargs.iteritems():
            if self.tile.properties.params.has_key(key):
                if value=='-=1':
                    value=self.tile.properties.params[key]()-1
                    self.tile.properties.params[key].set_value(value)
                elif value=='+=1':
                    value=self.tile.properties.params[key]()+1
                    self.tile.properties.params[key].set_value(value)
                else:
                    self.tile.properties.params[key].set_value(value)
            else:
                self.tile.properties.add_property(key, value, "string")
        print "UPDATED " + str(kargs)
            
    def update_display_properties(self):
        try:
            return self._update_display_properties(**request.params)
        except:
            print "REQUEST PARAMS:"
            print request.params
            raise
        
    def _update_monitor_attrs(self, configuration, scenario, display, tab, x_pos, y_pos, monitorname,**kargs):
        monitorview=self.tile.tile.get_monitor(monitorname)
        filtered=[ key  for key, value in kargs.iteritems()]
        monitorview.set_filtered(filtered)
        return self.display()
       
    def update_monitor_attrs(self):
        return self._update_monitor_attrs(**request.params)

    def _set_monitors(self, configuration, scenario, display, tab, x_pos, y_pos, **kargs):
        monitorlist={}
        self.tile.tile.clear()
        print "KARGS IS " +str(kargs)
        for ky,param in kargs.iteritems():
            print "PARAM IS " + param            
            monitorattr=param.split('.')
            monitorname=monitorattr[0]
            attrname=monitorattr[1]
            if not(monitorlist.has_key(monitorname)):
                monitorlist[monitorname]=[]
            monitorlist[monitorname].append(attrname)
        print "LIST IS : " + str(monitorlist)
        index=0
        for key,monitor in monitorlist.iteritems():
            self.tile.tile.place_monitor(key, index)
            index+=1            
            monitorview= self.tile.tile.get_monitor(key)
            if monitorview!=None:
                filter=monitor
                if len(filter)>0:
                    monitorview.set_filtered(filter)
                else:
                    monitorview.set_filtered(None)
        return ""
    
    def set_monitors(self):
        try:
            return self._set_monitors( **request.params)
        except:
            print "REQUEST PARAMS:"
            print request.params
            import traceback
            traceback.print_exception(sys.exc_info()[0], sys.exc_info()[1], sys.exc_info()[2])
            return self.display()

    def _place_monitor(self, configuration, scenario, display, tab, x_pos, y_pos, monitor, monitor_index,**kargs):
        #many arguments are used in init
        self.tile.tile.place_monitor(monitor, int(monitor_index))
        monitorview= self.tile.tile.get_monitor(monitor)
        filter=[ key  for key, value in kargs.iteritems()]
        if len(filter)>0:
            monitorview.set_filtered(filter)
        else:
            monitorview.set_filtered(None)
        return self.display()
    
       
        
    def place_monitor(self):
        try:
            return self._place_monitor( **request.params)
        except:
            print "REQUEST PARAMS:"
            print request.params
            import traceback
            traceback.print_exception(sys.exc_info()[0], sys.exc_info()[1], sys.exc_info()[2])
            return self.display()
       
             
 
    def remove_monitor(self):
        return self._remove_monitor( **request.params)
        
 