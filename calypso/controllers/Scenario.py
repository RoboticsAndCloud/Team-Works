import sys
import os
import os.path

import simplejson

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))+'/scenarios')
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))+'/scenarios/'+sys.argv[1]+'/lib')

from pylons import config
from pylons.decorators import jsonify

import signal
import shlex
import subprocess

import time

from ctypes import *

import calypso.process
import logging


import calypso.controllers

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from calypso.lib.base import BaseController, render

import calypso.tlm
import calypso.tlm.Models
import calypso.tlm.view
from calypso.tlm.view import *


import copy

log = logging.getLogger(__name__)

libs={}

class ScenarioController(BaseController):
    sessions={}
    simtime=None
    
    def __init__(self):
        path=os.path.dirname(os.path.abspath(__file__))+"/../../lib/"
        sys.path.append(path)
        path=os.path.dirname(os.path.abspath(__file__))+"/../.."
        sys.path.append(path)
    

    def __default_format(self):
        format=calypso.tlm.Format("Usage_Statistics")
        #system level usage stats
        for item in dir(self.session.msgmodule):
            if item.endswith('_System_Stats_DAO'):
                format.append(Monitor(item.replace("_DAO","")))
        #transport I/O stats 
        for item in dir(self.session.msgmodule):
            if item.endswith('_Trnsprt_Stats_DAO'):
                format.append(Monitor(item.replace("_DAO","")))
        #rate group usage stats
        for item in dir(self.session.msgmodule):
            if item.endswith('Hz_Stats_DAO'):
                format.append(Monitor(item.replace("_DAO","")))
        return format

    def __default_sys_stats_window(self):
        window=calypso.tlm.view.TelemetryWindow("System_Stats")
        window.tiles=[]
        #append table display for each processor's stats
        properties =  calypso.tlm.view.DisplayProperties(id="System_Stats", pos_x=0, pos_y=0)
        stats_monitors=[]
        #System stats in table:
        for item in dir(self.session.msgmodule):
            if item.endswith('_System_Stats_DAO'):
                name=item.replace("_DAO","")
                properties.name=name
                table=calypso.tlm.view.Tile(name,'table')
                monitor=MonitorView(name)
                #monitor.connect(self.session.msgmodule)
                table.append(monitor)
                stats_monitors.append(copy.copy(monitor))
                window.place_tile(table,properties)                
                properties.x_pos=properties.x_pos+1
        
        #append two plots for CPU usage -- one for execution and other for I/O
        properties.col_span=properties.x_pos
        print "################COL SPAN : " + str(properties.col_span)
        self.proc_count = properties.x_pos
        properties.x_pos=0
        properties.y_pos=properties.y_pos+1
        table=calypso.tlm.view.Tile("CPU_Usage_Execution",'plot')
        properties.col_span
        for monitor in stats_monitors:
            monitor.connect()
            monitor.filter_attributes(['Avg_Clk_Time'])
            table.append(monitor)
        window.place_tile(table,properties)
        
        properties.y_pos=properties.y_pos+1
        properties.x_pos=0

        #Now, transport stats
        trnsprt_monitors=[]
        for item in dir(self.session.msgmodule):
            if item.endswith('_Trnsprt_Stats_DAO'):
                name=item.replace("_DAO","")
                properties.name=name
                trnsprt_monitors.append(MonitorView(name))
        plot=Tile("CPU_Usage_DAO",'plot')
        for monitor in trnsprt_monitors:
            monitor.filter_attributes(['Avg_IO_Usr', 'Avg_IO_Sys'])
            plot.append(monitor)
        window.place_tile(plot,properties)
        properties.y_pos=properties.y_pos+1
        return window

    def __default_detail_stats_window(self):
        window=calypso.tlm.view.TelemetryWindow("Details")
        window.tiles=[]
        #append table display for each processor's stats
        y_pos=0
        x_pos=0
        for item in dir(self.session.msgmodule):
            if item.endswith('Hz_Stats_DAO'):
                name=item.replace("_DAO","")
                table=calypso.tlm.view.Tile(name,'table')
                properties=calypso.tlm.view.DisplayProperties(id=name, pos_x=0, pos_y=y_pos)
                monitor=MonitorView(name)
                table.append(monitor)
                window.place_tile(table, properties)
                y_pos=y_pos+1
                if y_pos==self.proc_count:
                    y_pos=0
                    x_pos=x_pos+1
        return window

    def __default_display(self):
        display=TelemetryDisplay("System_Stats", self.__default_format())
        display.append_tab(self.__default_sys_stats_window())
        display.append_tab(self.__default_detail_stats_window())
        return display
    
    def _get_session(self, scenario, version):
        tag=scenario+"."+version
        try:
            session_exists=( ScenarioController.sessions[tag].poll()==None )
        except:
            session_exists=False
        if not(session_exists):
            modulename=scenario + "." + version 
            module=__import__(modulename, globals(), locals(), ['Launch'],-1)
            cmdpath=str(os.path.dirname(__file__))
            ######
            #load core lib and modules
            #######
            libpath=os.path.dirname(os.path.dirname(cmdpath)) +"/scenarios/" + str(scenario) + "/"+str(version)+"/" + \
                          os.uname()[0] + "_" + os.uname()[4]  + "/lib/"
            scenlib=libpath+"libscenario_"+scenario+"_exports.so"
            cdll.LoadLibrary(scenlib)
            dll=CDLL(scenlib)
            dll.adainit()

            ############
            #launch main process for simulation execution/control
            ############
            command="python " + cmdpath  + "/launchmain.py " + str(scenario) + " "  +str(version) + " " + str(__file__)
            args=shlex.split(command)
            p = subprocess.Popen(shlex.split(command))
            self.session=calypso.Session(p, scenario, version)
            display=self.__default_display()
            format=self.__default_format()
            ScenarioController.sessions[tag]=self.session
            ScenarioController.simtime=dll.Sim_Time            
            ScenarioController.simtime.restype=c_double;
        else:
            self.session=ScenarioController.sessions[tag]
        session.usersession=self.session
        self.tasks=[]
        task=calypso.controllers.BaseController.TaskCategory("View",None)
        self.tasks.append(task)
        actionlist=calypso.controllers.BaseController.ActionList("Default Views")
        task.add_actionlist(actionlist)
        actionlist.add_action("/Scenario/display/"+self.session.scenario + "/" + self.session.version+"/System_Stats/0/1","Usage_Statistics")
        calypso.tlm.Models.create_default_views()
        for item in dir(calypso.tlm.Models.TlmViews):
            if item.endswith("_View"):
                actionlist.add_action("/Scenario/display/"+self.session.scenario + "/" + self.session.version+"/"+item+"/0/1",item)
        self.tasks.append(calypso.controllers.BaseController.TaskCategory("Create/Update",None))
        return self.session
        
    def view(self,id):
        c.scenariolist=[]
        c.scenariolist=os.listdir(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))+"/scenarios")
        c.activescenarios=[]
        for scenario in c.scenariolist:
            if scenario!= "__init__.py" and scenario != "__init__.pyc":
                versions=os.listdir(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))+"/scenarios/"+scenario)
                for version in versions:
                    tag = scenario +"." + version
                    if (ScenarioController.sessions.has_key(tag)):
                        c.activescenarios.append(scenario+" version "+ version)
        return render('/derived/scenariolist.html')


    def runscript( script ):
        raise "TBD"


    def load(self,scenario, version):
        session=self._get_session(scenario,version)
        c.scenario=scenario
        c.version=version
        tag=scenario+"."+version
        session.set_display(self.__default_display())
        c.content= session.display.render_html()
        c.formatname = session.display.format.name
        c.display=session.display
        c.tasks=self.tasks
        ScenarioController.sessions[tag]=session
        return render("/derived/scenario.html")
        

    def launch(self, scenario, version):
        tag=scenario+"."+version
        session=ScenarioController.sessions[tag]
        session.display=session.display2
        #############             
        #Periodically send telemetry updates until simulation process ends:
        ############
        yield "<script>ts=parent."+session.display.format.name+"_ts;"
        lasttime=-1.0
        while session.poll()==None:
            try:
                if lasttime != ScenarioController.simtime():       
                    lasttime=ScenarioController.simtime()
                    json=simplejson.dumps({'time':lasttime, 'tlm':session.display.format.snapshot()})
                    yield "ts.tick( " + str(lasttime) + "," + json +  ", false);</script><script>;"
            except Exception as exc:
                print "OOPS" + str(exc)
            time.sleep(1.0)            
        session.wait()
        

    def display(self, scenario, version, display, tab):
        tag=scenario+"."+version
        ScenarioController.sessions[tag]=self._get_session(scenario,version)
        session=ScenarioController.sessions[tag]
        print "DISPLAY?" + str(isinstance(display,calypso.tlm.view.TelemetryDisplay))+display
        session.set_display(calypso.tlm.view.TelemetryDisplay.displays[display])
        
        c.scenario=scenario
        c.version=version
        c.format=session.display.format
        c.formatname=session.display.format.name
        try:
            c.selected=0
            while session.display.tabs[c.selected].name!=tab:
                c.selected=c.selected+1
        except:
            c.selected=0
        session.selectedtab=c.selected
        c.tabs=session.display.tabs
        c.tlmwindow=session.display.render_html()
        c.tasks=self.tasks
        c.display=session.display
        return render('/derived/scenario.html')
        
        
    def start(self, scenario, version):
        tag=scenario+"."+version
        print "SIGNALLING " + tag
        if ScenarioController.sessions.has_key(tag):
            ScenarioController.sessions[tag].send_signal(signal.SIGCONT)
            print "SIGNALLED"
            return ""
        else:
            self.load(scenario, version)
            return session.usersession.display.format.get_name()+"_ts.clear(); window.location='/Scenario/display/"+scenario + "/"+version + "/"+ \
                   session.usersession.display.name + "/" + \
                   session.usersession.display.tabs[0].name+"/1';"


    def stop(self, scenario, version):
        tag=scenario+"."+version
        if ScenarioController.sessions.has_key(tag):
            session=ScenarioController.sessions[tag]
            session.send_signal(signal.SIGINT)
            time.sleep(5.0)
            try:
                session.terminate()
            except:
                pass
            del ScenarioController.sessions[tag]
            calypso.tlm.clear()
            
        return "STOPPED"

