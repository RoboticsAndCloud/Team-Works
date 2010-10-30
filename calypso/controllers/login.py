import logging


from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import validate
import formencode
from formencode.schema import SimpleFormValidator

from calypso.lib.base import BaseController, render
import calypso.lib.helpers as h
import calypso.model as model
import calypso.users
from calypso.model.meta import Session as sqlsession

import hashlib

log = logging.getLogger(__name__)

def validate_password(value_dict, state,validator):
    userid=value_dict['username']
    passwd=value_dict['password']
    user=calypso.users.User(userid,
                            hashlib.md5(passwd).hexdigest())
    if user.verify():
        return {}
    else:
        return {'password':'Invalid password'}

class LoginForm( formencode.Schema):
    allow_extra_fields = True
    filter_extra_feilds = True
    username = formencode.validators.String(
        not_empty = True,
        messages={'empty':'cannot be empty'})
    chained_validators=[SimpleFormValidator(validate_password)]
    

SQLSessions=BaseController.SQLSessions

class LoginController(BaseController):

    requires_auth=False

    def index(self):
        c.heading = "Calypso Login"
        return render('/base/login.html')

    def login(self):
      # Both fields filled?
       form_username = str(request.params.get('username'))
       form_password = str(request.params.get('password'))

      # Get user data from database
       user=calypso.users.User(form_username,
                               hashlib.md5(form_password).hexdigest())
       if not user.verify():           
           return render('/base/login.html')
       #BaseController.SQLSessions[form_username]=sqlsession
  
       # Mark user as logged in
       session['user'] = form_username
       session.save()

       # Send user back to the page he originally wanted to get to
       if session.get('path_before_login'):
           redirect_to(session['path_before_login'])
       else: # if previous target is unknown just send the user to a welcome page
           return render('index.html')
    
    def logout(self):
        if 'user' in session:
           del session['user']
           session.save()

        return render('/base/login.html')
