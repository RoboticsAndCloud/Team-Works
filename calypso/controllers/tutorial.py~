import festival
import calypso.config.routing
import calypso.controllers
import urllib
import string
import time

###
import subprocess

import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from webhelpers.html import literal

from calypso.lib.base import BaseController, render
import calypso.lib.helpers

log = logging.getLogger(__name__)

def escape(text):
    return string.replace(string.replace(string.replace(string.replace(text,' ',''),')',''),'(',''),'/','')

class Tutorial:

    active = False
    ttsclient = festival.Festival()
    current_module = ''
    current_topic=''
    clientscript=''
    next_index = 0
    preamble = ''
    
    class Item:

        def __init__(self, id, text, action_url='', override_name=''):
            self.id=escape(id)
            if override_name=='':
                self.name = id
            else:
                self.name=override_name
            self.text = text
            self.action_url = action_url
            self.clientscript = """
                id = '%s';
                position_pointer(id);
                elem=$('#'+id);
                fs=elem.css('font-size');
                elem.css({'fontWeight':'bold'});
                elem.css({'bgColor':'yellow'});
                elem.css({'bgcolor':'yellow'});
                elem.animate({fontSize:'24px'},1000,null,null).animate({top:'+=20px'},100).animate({top:'-=20px'},100).animate({top:'+=20px'},100).animate({top:'-=20px'},100);
                //elem.animate({fontSize:fs,borderWidth:'20pt',bgcolor:'yellow'},2000,null,null);
                wait_for_audio_completion(null);
                """%(escape(id))
            
        def speak(self):
            return Tutorial.ttsclient.wave(self.text)

    def __init__(self):
        self.items = []
        self.itemdict={}
        self.itemlen = 0
        Tutorial.clientscript = '//NONE'
        
    def next_item(self):
        if self.next_index >= self.itemlen:
            self.current_topic="/tutorial/speak/%s/view/1"%self.current_module
            self.next_index=0
            return ''
        else:
            self.next_index = self.next_index + 1
            self.current_topic = "/tutorial/speak_item/%s"%escape(self.items[self.next_index-1].id)
            return self.items[self.next_index-1].clientscript


    def add_link(self,id, text, action_url='', override_name=''):
        if not(self.itemdict.has_key(escape(id))):
            item = tutorial.Item(id, text, action_url,override_name)
            self.items.append(item)
            self.itemdict[escape(id)]=item
            self.itemlen=self.itemlen+1


    def speak(self, id):
        return self.itemdict[id].speak()


    def reset(self):
        self.next_index = 0
        
tutorial = Tutorial()

class TutorialController(BaseController):


    def __init__(self):
        BaseController.__init__(self)
        self.user = None
    
    def tutor(self,primary_controller,primary_action = None,*args,**kargs):
        tutorial.current_module=primary_controller
        tutorial.current_topic="/tutorial/speak/%s/%s/1"%(primary_controller, primary_action)
        print "GOT TUTOR REQ : %s.%s"%(primary_controller, primary_action)
        if primary_action == None or primary_action=='view':
            tutorial.reset()
            return self.conduct( primary_controller)
        else:
            exec('import calypso.controllers.' + primary_controller + ' as m')
            _classname = primary_controller[0].capitalize() + primary_controller[1:] + 'Controller'
            _func=eval('m.' + _classname + '.' + primary_action)
            _inst=eval('m.' + _classname + "()")
            return _func(_inst)

    def start_tutorial(self):
        tutorial.reset()
        response.content_type='audio/x-wav'
        #return Tutorial.ttsclient.wave
        args = []
        text="""
        \"Calypso uses a basic template for its layout.  The layout includes breadcrumbs for navigation among main modules of the application.
        Below the breadcrumbs, the main operations for the module are found in the column on the left,
        organized into categories.  Each category contains lists of links
        used to perform various operations.  This tutorial will walk through each of these links and provide a description.\"
        """
        args.append("/opt/swift/bin/swift")
        args.append("-o")
        args.append("-")
        args.append(text)
        p = subprocess.Popen(args, 
                              stdin = subprocess.PIPE, 
                              stdout = subprocess.PIPE, 
                              stderr = subprocess.PIPE,
                              close_fds = True)
        stdout,stderr = p.communicate(text)
        return stdout


    def speak_current(self):
        response.content_type='audio/x-wav'
        return redirect_to(tutorial.current_topic)

    def speak(self, primary_controller, primary_action = None):
        tutorial.current_module = primary_controller
        response.content_type='audio/x-wav'
        try:
            exec('import calypso.controllers.' + primary_controller + ' as m')
            _classname = primary_controller[0].capitalize() + primary_controller[1:] + 'Controller'
            _ctrlr_module=getattr(calypso.controllers,primary_controller)
            _class = getattr(_ctrlr_module,_classname)
            if primary_action != None and primary_action!='view':
                _func = getattr(_class, primary_action)
                _doc = Tutorial.preamble + _func.__doc__
            else:
                _doc = "Welcome to Calypso's tutorial on " + primary_controller + ".  " 
                _doc = _doc + _class.__doc__ + """.  You may click on any link to explore its usage.
                Or use the controls provided to traverse the tutorial."""
            Tutorial.preamble = ''
            return Tutorial.ttsclient.wave(_doc)
        except:
            return ''


    def speak_next(self):
        index = tutorial.next_index
        Tutorial.clientscript =  tutorial.next_item()
        c.clientscript = Tutorial.clientscript
        Tutorial.preamble='\"%s\".: Click this link to '%tutorial.items[index].name
        return tutorial.items[index].action_url

        
    def speak_item(self,id):
        print "SPEAKING " + id
        response.content_type='audio/x-wav'
        return tutorial.speak(id)

    
    def conduct(self, controller):
        #commit database changes and swtich
        #to test database for tutorial
        self.user = calypso.users.UserSession.user
        calypso.users.UserSession.user = calypso.users.User('tutorial','tutorial')
        calypso.users.UserSession.user.firstname = self.user.firstname
        calypso.users.UserSession.user.lastname = self.user.lastname
        calypso.db.session.restart(tutorial=True)
        #setting active to true will render the page upon
        #redirect to the requested page except in tutorial
        #mode
        tutorial.active = True;
        if controller != None:
            return redirect_to( calypso.lib.helpers.url_for( controller=controller, action='view') )
        else:
            return redirect_to( calypso.lib.helpers.url_for( controller='home', action='view') )
        
    def stop(self):
        calypso.db.session.restart(tutorial=False)
        tutorial.active = False
        calypso.users.UserSession.user = self.user
        redirect_to( calypso.lib.helpers.url_for(controller='home', action='view'))



    def speak_welcome(self):
        response.content_type = 'audio/x-wav'
        if self.__dict__.has_key('user'):
            response.content = Tutorial.ttsclient.wave("Welcome, " + self.user.firstname + \
                                                       " to Calypso's tutorial.")
        else:
            response.content = Tutorial.ttsclient.wave("Welcome to Calypso' tutorial.")            
        return

    def restart(self):
        tutorial.reset()
        redirect_to(calypso.lib.helpers.url_for(controller='tutorial', action='tutor', primary_controller='administration', primary_action='view',id=1))
