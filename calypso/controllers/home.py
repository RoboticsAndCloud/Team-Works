import logging

import calypso.users

import festival

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from calypso.lib.base import BaseController, render

log = logging.getLogger(__name__)

class HomeController(BaseController):

    def __init__(self):
        self.ttsclient = festival.Festival()
        BaseController.__init__(self)

    def view(self):
        # Return a rendered template
        #return render('/home.mako')
        # or, return a response
        if request.params.has_key('error'):
            c.errortext=request.params['error']
        return render('derived/home/home.html')

    def welcome_message(self):
        username=calypso.users.UserSession.user.firstname
        response.content_type='audio/x-wav'
        response.content = self.ttsclient.wave("Welcome,  %s,  to Calypso!"%username)
        return
