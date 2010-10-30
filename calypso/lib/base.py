"""The base Controller API

Provides the BaseController class for subclassing.
"""
from pylons.controllers import WSGIController
from pylons.templating import render_mako as render
from pylons import request
from pylons.controllers.util import  redirect_to

from calypso.model import meta
import calypso.lib.helpers as h
from pylons import session 
from formencode import validators
from pylons.decorators import validate

class BaseController(WSGIController):

    requires_auth=True
    SQLSessions={}

    def __before__(self, action):
        if self.requires_auth:
           if 'user' not in session:               
               session['path_before_login'] = request.path_info +"?"
               for key, value in request.params.iteritems():
                   session['path_before_login']+= str(key +"=" + value + "&")
               session.save()
               return redirect_to(h.url_for(controller='login'))
           else:
               self.user=session['user']
 
 
    def __call__(self, environ, start_response):
        """Invoke the Controller"""
        # WSGIController.__call__ dispatches to the Controller method
        # the request is routed to. This routing information is
        # available in environ['pylons.routes_dict']
        try:
            return WSGIController.__call__(self, environ, start_response)
        finally:
            meta.Session.remove()
