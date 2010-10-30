import logging
import os

import festival
import datetime

import pylons
from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from crontab import CronTab

import calypso.lib.helpers as h
from calypso.lib.base import BaseController, render
import calypso.db
import calypso.users
import calypso.controllers
import calypso.net
import hashlib

import smtplib
import email.mime.text

import formencode
from pylons.decorators import validate

import webtutorial

log = logging.getLogger(__name__)
ADMIN_HOME='/derived/administration.html'

class UniqueAssetName(formencode.validators.String):
    """Checks for unique user name"""
    allow_extra_fields = True
    filter_extra_fields = True

    def _to_python(self, value, state):
        return value

    def validate_python(self,value,state):
        if len(calypso.db.session.query(calypso.net.topology.Asset).filter_by(name=value).all())!=0:
            raise formencode.Invalid('An asset with that name already exists.',value,state)

class UniqueAddressAndPort(formencode.FancyValidator):
    """Checks for unique user name"""
    allow_extra_fields = True
    filter_extra_fields = True
    
    def _to_python(self, value, state):
        return value

    def validate_python(self,value,state):
        if len(calypso.db.session.query(calypso.net.topology.Asset).filter_by(host=value['ip_address'], port=value['port']).all())!=0:
            raise formencode.Invalid('An asset with that port and address already exists.',value,state)

class AssetEntryValidator(formencode.Schema):
    """class to validate user entry for an asset."""
    allow_extra_fields = True
    filter_extra_fields = True
    port = formencode.validators.Int(not_empty=True)
    ip_address = formencode.validators.IPAddress(not_empty=True)
    name = UniqueAssetName(not_empty=True)

class DatabaseScheduleValidator(formencode.Schema):
    """class to validate user entry for scheduling database backups."""
    allow_extra_fields = True
    filter_extra_fields = True
    schedule = formencode.validators.Int(not_empty=True)
    tod=None
    ampm=None
    archive_prefix=formencode.validators.String(min=3)

class DatabaseConfigurationValidator(formencode.Schema):
    """class to validate configuration inputs from user"""
    allow_extra_fields = True
    filter_extra_fields = True
    database_host=formencode.validators.String(not_empty=True)
    database_port=formencode.validators.Int(not_empty=True)
    database_name=formencode.validators.String(not_empty=True,min=3)
    smtp_username=formencode.validators.String(not_empty=True)
    smtp_host=formencode.validators.String(not_empty=True)
            
class AdministrationController(calypso.controllers.BaseController):
    """
    Use this module for configuration of the Calypso application and database, as
    well as user account administration.
    """
    user = None
        
    def index(self):
        # Return a rendered template
        #return render('/administration.mako')
        # or, return a response
        return view(self)

    def __init__(self):
        calypso.controllers.BaseController.__init__(self)
        task = self.add_task('Tool Administration', 'configuration22.png')
        list = task.add_actionlist( 'Administer Database')
        list.add_action('backup_database', 'Backup Database')
        list.add_action('restore_database', 'Restore Database')
        list.add_action('configure_database_settings', 'Configure Database Settings')
        list = task.add_actionlist('Configure Network')
        list.add_action('configure_network','Add/Delete Available Hosts')

        task = self.add_task("Users", "users.png")
        list = task.add_actionlist("Administer User Accounts")
        list.add_action('list_all_users', 'Edit List of Users')
        list.add_action ('create_user', 'Add New User')

        users=calypso.db.session.query(calypso.users.User).order_by(calypso.users.User.lastname,calypso.users.User.userid)
        if not( self.taskdict.has_key("Users")):
            self.add_task("Users", "users.png")
        list = self.taskdict["Users"].add_actionlist("Update Users")
        username_speech="Update Users.  This section contains a list of all users."
        for user in users:
            if user.lastname=='' or user.lastname==None:
                list.add_action('edit_user',user.userid, userid=user.userid,override_name=username_speech)
            else:
                list.add_action('edit_user', user.lastname + ', ' + user.firstname, userid=user.userid, override_name=username_speech)


    def setup(self):
        h.withtitles=True
        c.tasks=self.tasks
        c.heading='Calypso Administration'
        c.breadcrumbs=[{'text':'Administration'}]
        

    def view(self):
        """Present the main user interface for Calypso administration."""
        self.setup()
        if calypso.users.UserSession.user==None or (not(calypso.users.UserSession.user.verify_is_admin())):
            redirect_to(controller='home', action='view',error='Insufficient Priveleges')
        return render(ADMIN_HOME)
    
    def edit_user(self,userid=None):
        """Edit a user's account information, including his or her user name, full name and e-mail information."""
        self.setup()
        if userid==None:
            print pylons.request.params
            userid=pylons.request.params['userid']
        c.user=calypso.db.session.query(calypso.users.User).filter_by(userid=userid).one()
        c.body=render('/derived/administration/edit_user_form.html')
        return render(ADMIN_HOME)

    def update_user_data(self):
        """Commit updated user info to database in response to a user form submittal."""
        self.setup()
        if request.params.has_key('reset_password'):
            c.jscript="confirmed=confirm('Reset password and send e-mail for user "+request.params['userid'] +"?');"+"window.location='" + \
               h.url_for(controller='administration',
                      action='update_user_data')+"?confirmed='+confirmed;"
            self.user=calypso.db.session.query(calypso.users.User).filter_by(userid=request.params['olduserid']).one()
            self.user.password=hashlib.md5('default').hexdigest()
            #inform user via email
            msg = email.mime.text.MIMEText('Your password to Calypso has been reset to the default.  Please change it as soon as possible.')
            msg['Subject'] = 'Calypso passowrd reset'
            msg['From'] = 'calypso_admin@calypso.admin'
            msg['To'] = self.user.email
            if self.user.email!='':
                s = smtplib.SMTP()
                s.connect('localhost')
                s.sendmail('calypso_admin@calypso.admin',
                           self.user.email,
                           msg.as_string())
                s.quit()
            c.message="Password successfully reset to default"
            return render(ADMIN_HOME)
        elif request.params.has_key('confirmed'):
            if request.params['confirmed']=='true':
                calypso.db.session.sqlsession.commit()
                c.message="User data has been updated"
            else:
                return self.edit_user(AdministrationController.user.userid)
        else:
            self.user=calypso.db.session.query(calypso.users.User).filter_by(userid=request.params['olduserid']).one()
            self.user.userid=request.params['userid']
            self.user.firstname=request.params['firstname']
            self.user.lastname = request.params['lastname']
            if request.params.has_key('email'):
                self.user.email=request.params['email']
            AdministrationController.user=self.user
            c.jscript="confirmed=confirm('Really update information for user "+request.params['userid'] +"?');"+"window.location='" + h.url_for(controller='administration',
                                                                                                                                                 action='update_user_data')+"?confirmed='+confirmed;"
        return render(ADMIN_HOME)

    def list_all_users(self):
        """Provide a list of all user accounts to edit user information or delete user accounts."""
        self.setup()
        c.users = calypso.db.session.query(calypso.users.User).all()
        c.body = render('/derived/user_list.html')
        return render(ADMIN_HOME)

    def delete_user(self):
        self.setup()
        userid=request.params['userid']
        if userid=='admin':
            return render('derived/administration.html')
        if request.params.has_key('confirmed'):
            user=calypso.db.session.query(calypso.users.User).filter_by(userid=userid).one()
            if request.params['confirmed']=='true':
                calypso.db.session.delete(user)
                c.message="User with id " + userid + " has been deleted"
                self.setup()
                return render(ADMIN_HOME)
            else:
                return self.list_all_users()
        else:
            c.users = calypso.db.session.query(calypso.users.User).all()
            c.body = render('/derived/user_list.html')
            c.jscript="confirmed=confirm('Really delete user with id " + \
                       userid + "?');"+"window.location='" + \
               h.url_for(controller='administration',
                         action='delete_user') + \
                         "?confirmed='+confirmed+'&userid=" + \
                         userid + "';"
            return render(ADMIN_HOME)
            
    def create_user(self):
        """Create a new user account with a default password.  If an address is provided,
        an e-mail will be sent confirming the creation of the account."""
        self.setup()
        c.body=render('/derived/administration/create_user_form.html')
        c.user = None
        return render(ADMIN_HOME)

    def add_user(self):
        self.setup()
        userid=request.params['userid']
        password=hashlib.md5('default').hexdigest()
        user = calypso.users.User(userid,password)
        user.firstname = request.params['firstname']
        user.lastname =  request.params['lastname']
        user.email = request.params['email']
        calypso.db.session.add(user)
        calypso.db.session.commit()
        c.message = 'User "' + user.firstname + ' ' + \
                  user.lastname + '" has been created.'
        self.setup()
        return render(ADMIN_HOME)

    def configure_database_settings(self):
        """Configure database and e-mail settings. """
        self.setup()
        h.withtitles=False
        c.body=render('/derived/administration/configuration_form.html')
        return render(ADMIN_HOME)

    @validate(schema=DatabaseConfigurationValidator(),form='configure_database_settings')
    def set_configuration(self):
        """Commit the user defined configuration"""
        config_path = __file__
        base_dir=os.path.dirname(config_path)
        config_file=os.path.join(base_dir,'../config/configuration.py')
        calypso.config.configuration.database_host=request.params['database_host']
        calypso.config.configuration.database_port=request.params['database_port']
        calypso.config.configuration.database_name=request.params['database_name']
        calypso.config.configuration.smtp_host=request.params['smtp_host']
        db_host=request.params['database_host']
        db_port=request.params['database_port']
        db_name=request.params['database_name']
        smtp_host=request.params['smtp_host']
        smtp_username=request.params['smtp_username']
        file = open(config_file,"w")
        file.write('database_host="'+ db_host+'"\n')
        file.write('database_port='+ db_port+'\n')
        file.write('database_name="'+ db_name+'"\n')
        file.write('smtp_host="' + smtp_host + '"\n')
        file.write('smtp_username="'+smtp_username+'"\n')
        file.close()
        self.setup()
        c.message="Successfully configured"
        return render(ADMIN_HOME)

    def backup_database(self):
        """Archive a snapshot of the current database contents.
        Upon confirmation from the user,  Calypso will provide a five minute warning to all
        active users of the system. An e-mail will also be sent to all users alerting them
        that the system will be unavailable."""
        self.setup()
        h.withtitles=False
        c.body=render('/derived/administration/backup_form.html')
        return render(ADMIN_HOME)

    @validate(schema=DatabaseScheduleValidator(),form='backup_database')
    def archive_database(self):
        cron_entry={
            '12am' : '0 0',
            '2am': '0 2',
            '4am': '0 4',                     
            '6am': '0 6',
            '8am': '0 8',            
            '10am': '0 10',
            '12pm': '0 12',
            '2pm': '0 14',
            '4pm': '0 16',                     
            '6pm': '0 18',
            '8pm': '0 20',            
            '10pm': '0 22'            
                     }[request.params['tod'] + request.params['ampm'] ]
        
        cron_entry=cron_entry + { '0' : ' * * * ', #daily
                     '1' : ' 1 * * ', #weekly
                     '2' : ' 1 1 * ' #monthly
                     }[ request.params['schedule'] ]
        cron_entry=cron_entry + ' mysql'
        archive_name = request.params['archive_prefix'] + datetime.date.today().strftime('%Y_%m_%d') + '.sql'
        cron_entry=cron_entry + ' mysqldump Calypso -u jrusnak -p zg7jmttk > /home/jrusnak/'+archive_name

        tab=CronTab()        
        tab.remove_all('mysqldump')
        cron=tab.new()
        cron.parse(cron_entry)
        tab.write()
        self.setup()
        c.message="Successfully scheduled database backups "
        return render(ADMIN_HOME)

    def restore_database(self):
        """Captures the current database contents to an archive and then
           restores a previsouly archived database"""
        self.setup()
        c.message='NOT IMPLEMENTED YET'
        return render(ADMIN_HOME)
           
    def configure_network(self):
        """Allows the user to define the topology of available hosts for connection to assets."""
        self.setup()
        h.withtitles=False
        self.topology = calypso.net.topology.Topology()
        c.hosts = self.topology.hosts()
        c.body = render('/derived/administration/topology.html')
        return render(ADMIN_HOME)


    @validate(schema=AssetEntryValidator(),form='configure_network')
    @validate(schema=UniqueAddressAndPort(),form='configure_network')
    def add_asset(self):
        """Adds a user-requested asset to the list of assets.  If an entry with the name already exists,
        an error is displayed instead."""
        self.topology = calypso.net.topology.Topology()
        name=request.params['name']
        host=request.params['ip_address']
        port=int(request.params['port'])
        if(self.topology.hostdict().has_key(name)):
            c.clientscript="""alert('Name already exists.  Names must be unique.');"""
        else:
            self.topology.add_asset_by_name(name, host, port)
        self.setup()
        c.hosts = self.topology.hosts() 
        c.body = render('/derived/administration/topology.html')
        return render(ADMIN_HOME)

    def delete_hostentry(self):
        """Delete an asset from the list"""
        self.topology = calypso.net.topology.Topology()
        name=request.params['name']
        print "PARAM" + str(request.params)
        if not(request.params.has_key("confirmed")):
            #confirm through dialog box if user really wishes to delete this item
            c.clientscript="""if(confirm('Really remove this asset?')) {
             $.ajax({
               type:'POST',
               data: {confirmed:'TRUE',
                     name : '%s'},
               url:'/administration/delete_hostentry',
               success:function(){window.location='/administration/configure_network';}
            });
            }"""%name
            c.message="Deleting asset \"%s\""%name
        else:
            #confirmed, so toss it:
            self.topology.remove_asset_by_name(name)
            c.body = render('/derived/administration/topology.html')
        self.topology = calypso.net.topology.Topology()
        self.setup()
        c.hosts = self.topology.hosts() 
        return render(ADMIN_HOME)
