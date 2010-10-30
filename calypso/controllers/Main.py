import logging
import formencode

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from calypso.lib.base import BaseController, render
from calypso import session as calypso_session
import calypso.controllers.forms as forms
from pylons.decorators import validate

from calypso.model.meta import Session as sqlsession
from calypso.model.meta import metadata
import sqlalchemy
from sqlalchemy import Column, Integer, String

log = logging.getLogger(__name__)


class Project:
    
    class DAO(object):
        table=None

        def __init__(self, project_name, contract_id, project_type):
            self.project_name = project_name
            self.contract_id = contract_id
            self.project_type = project_type
            sqlsession.add(self)            
            sqlsession.commit()
            
    def __init__(self, project_name, contract_id, project_type):
        daos=sqlsession.query(Project.DAO).filter_by(project_name=project_name).all()
        if (len(daos)>0):
            self.dao=daos[0]
        else:
            self.dao=Project.DAO(project_name, contract_id, project_type=project_type)
    
    def get_name(self):
        return self.dao.project_name
    
    def get_project_type(self):
        return self.dao.project_type
    
    @staticmethod
    def query_projects():
        daos=sqlsession.query(Project.DAO).all()
        projects={}
        for dao in daos:
            projects[dao.project_name] = Project(dao.project_name, dao.contract_id, dao.project_type)
        return projects
        

class Workbook:
    
    class DAO(object):
        table=None

        def __init__(self, project_name, workbook_name):
            self.project_name = project_name
            self.workbook_name = workbook_name
            sqlsession.add(self)            
            sqlsession.commit()
            
    def __init__(self, project_name, workbook_name):
        daos=sqlsession.query(Workbook.DAO).filter_by(project_name=project_name,workbook_name=workbook_name).all()
        if (len(daos)>0):
            self.dao=daos[0]
        else:
            self.dao=Workbook.DAO(project_name, workbook_name)
    
    def get_name(self):
        return self.dao.project_name + "." + self.dao.workbook_name
    
    @staticmethod
    def query_workbooks():
        daos=sqlsession.query(Workbook.DAO).all()
        workbooks={}
        for dao in daos:
            workbooks[dao.project_name + "." + dao.workbook_name] = Workbook(dao.project_name, dao.workbook_name)
        return workbooks
        
        
        
class MainController(BaseController):

    _projects={}

    def __before__(self,action):
        BaseController.__before__(self, action)
        if request.params.has_key('theme'):
            c.theme=request.params['theme']
        elif calypso_session.has_key('theme'):
            c.theme=calypso_session['theme']
        else:
            c.theme='default'
        calypso_session['theme']=c.theme
        if not(calypso_session.has_key(self.user)): calypso_session[self.user]={}
        c.user=self.user
        forms.UniqueProject.projects=Project.query_projects()
        forms.UniqueWorkbook.projects=Workbook.query_workbooks()
        c.projects=forms.UniqueProject.projects
        
    def get_projects(self):
        return forms.UniqueProject.projects;

    def index(self):
        # Return a rendered template
        #return render('/Main.mako')
        # or, return a response
        return render('/main/main.html')
    
    def new_project_form(self):        
        c.mode='new_project'
        if not calypso_session.has_key('breadcrumbs'):
            calypso_session['breadcrumbs']={}
        url='/main/main.html'
        return render(url)
    
    @validate(schema=forms.ProjectForm, form='new_project_form')
    def new_project(self):        
        project_name=self.form_result.get('project_name')
        contract_id=self.form_result.get('contract_id') 
        project_type=self.form_result.get('project_type')
        forms.UniqueProject.projects[project_name] = Project(project_name, contract_id, project_type=project_type)
        c.project_class='Project' 
        return render('/main/main.html')
    
    def new_workbook_form(self):
        c.mode = 'new_workbook'
        if not calypso_session.has_key('breadcrumbs'):
            calypso_session['breadcrumbs']={}
        url='/main/main.html'
        return render(url)
        
    @validate(schema=forms.WorkbookForm, form='new_workbook_form')
    def new_workbook(self):
        project_name=self.form_result.get('workbook_project_name')
        workbook_name=self.form_result.get('workbook_name')
        forms.UniqueWorkbook.workbooks[project_name + "." + workbook_name] = Workbook(project_name, workbook_name )
        c.project_type=forms.UniqueProject.projects[project_name].get_project_type()
        c.project_class='Project'
        return render('/main/workspace.html')
    
    def workspace(self):
        if request.params.has_key('project_class'):
            c.project_class=request.params['project_class']
        return render("/main/workspace.html")


Project.DAO.table=sqlalchemy.Table("Projects", metadata,
                                        Column('project_name', String(80), primary_key=True),
                                        Column('contract_id',String(180)),
                                        Column('project_type', String(80)),
                                        Column('id',Integer,  unique=True, autoincrement=True, primary_key=True),
                                        useexisting=True)

Workbook.DAO.table=sqlalchemy.Table("Workbooks", metadata,
                                        Column('project_name', String(80), primary_key=True),
                                        Column('workbook_name',String(180)),
                                        Column('id',Integer,  unique=True, autoincrement=True, primary_key=True),
                                        useexisting=True)


"""map tables to database"""
sqlalchemy.orm.mapper(Project.DAO, Project.DAO.table)
sqlalchemy.orm.mapper(Workbook.DAO, Workbook.DAO.table)
