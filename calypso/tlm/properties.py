import copy
import sys
from calypso.model.meta import Session as sqlsession


class DisplayPropertyItem(object):
    """
    Class to hold a property of a tile display
    """
    dao   = None

    class DAO(object):
        table = None

        def __init__(self, name, user, ownername, displayname, value, type):
            self.name=name
            self.user=user
            self.parent=ownername
            self.display=displayname
            self.type=type
            if value==None:
                self.value='0'
            else:   
                self.value=value
            sqlsession.add(self)
            sqlsession.commit()
       
        def commit_change(self):
            sqlsession.commit()
        
        def set_type(self, type):
            self.type=type
            self.commit_change()
                
        
        def set_owner(self, owner):
            self.parent=owner.get_name()
            self.commit_change()
            
        def set_display(self, display):
            self.display=display.get_name()

           
        def set_value(self, value):
            self.value = value
            self.commit_change()
                
            
    def __init__(self, name, user,  owner, displayname, value, type):
        self.name=name
        self.owner=owner
        daos= sqlsession.query(DisplayPropertyItem.DAO).filter_by(name=name, user=user, display=displayname, parent=owner.get_name()).all()
        if len(daos)>0:
            self.dao =daos[0]
            self.dao.type=type
        else:
            if (name=='col_span' or name=='row_span') and value==None:
                value=1
            elif value==None:
                value=0
            self.dao=DisplayPropertyItem.DAO(name=name, user=user, ownername=owner.get_name(), displayname=displayname, value=value, type=type)
     
    def type(self):
        return self.dao.type
    
    def set_type(self, type):
        self.owner.paramlist.append({'name':self.name, 'param':self})        
        self.dao.set_type(type)

    def set_owner(self, owner):
        self.dao.set_owner(owner)
        
    def set_display(self, display):
        self.dao.set_display(display)
        
    def copy_to(self, displayname):
        sqlsession.commit()
        newdao=DisplayPropertyItem(name=self.dao.name, user=self.dao.user, owner=self.owner, displayname=displayname, value=self.dao.value, type=self.dao.type).dao
        self.dao=None
        self.dao=newdao
        sqlsession.commit()
 
    def set_value( self, value ):
         self.dao.set_value(str(value))
         try:
             sqlsession.add(self.dao)
         except:
             pass
         sqlsession.commit()
         print "SET VALUE OF " +self.dao.parent +" TO " + self.dao.name + " TO " + self.dao.value
           
    def __call__(self):
        """
        Treat this class like a function to be called with no parameters
        It will return the value of the property item it holds
        """
        try:
           sqlsession.add(self.dao)
        except:
            pass
        try:
            if self.name=='x_pos' or self.name=='y_pos' or \
                   self.name=='col_span' or self.name=='row_span':
                return int(self.dao.value)
            else:
                return self.dao.value
        except:
            import traceback
            traceback.print_exception(sys.exc_info()[0], sys.exc_info()[1], sys.exc_info()[2])
            return ''

    def delete(self):
        """
        Remove from database
        """
        if self.dao != None:
            sqlsession.flush()
            sqlsession.delete(self.dao)
            sqlsession.commit()
            del self.dao


class DisplayProperties:
    """
    Class to capture display properties for displaying tiles within a table or in a plot
    """
    
    def __init__(self, user, parent, display, x_pos=None, y_pos=None, col_span=None, row_span=None, **kargs):
        self.user=user
        self.parent=parent
        self.display=display
        self.params={}
        self.paramlist=[]
        self.name=parent.get_name()
        self.x_pos=DisplayPropertyItem( name="x_pos", user=user, owner=self, displayname=display.get_name(), value=x_pos,type='integer')
        self.y_pos=DisplayPropertyItem( name="y_pos", user=user, owner=self, displayname=display.get_name(),value=y_pos,type='integer')
        self.col_span=DisplayPropertyItem( name="col_span", user=user, owner=self, displayname=display.get_name(), value=col_span,type='integer')
        self.row_span=DisplayPropertyItem( name="row_span", user=user, owner=self, displayname=display.get_name(),value=row_span,type='integer')
        #self.Width=DisplayPropertyItem( name="Width", user=user, owner=self, displayname=display.get_name(), value=width,type='integer')
        #self.Height=DisplayPropertyItem( name="Height", user=user, owner=self, displayname=display.get_name(),value=height,type='integer')
        self.params['x_pos'] = self.x_pos
        self.params['y_pos'] = self.y_pos
        #self.params['width'] = self.Width
        #self.params['height'] = self.Height
        self.params['col_span'] = self.col_span
        self.params['row_span'] = self.row_span
        self.params['title']=DisplayPropertyItem( name="title", user=user, owner=self, displayname=display.get_name(), value=self.parent.get_name(),type='string')
        for key,value in kargs.iteritems():
            self.__dict__[key]=DisplayPropertyItem( name=key, user=user, owner=self, displayname=display.get_name(),value=str(value),type='string')
            self.params[key]=self.__dict__[key]
        self.selected=False
        
    def add_property(self, name, value, type):
        self.name=self.parent.get_name()
        self.params[name]=DisplayPropertyItem(name=name, user=self.user, owner=self, displayname=self.display.get_name(), value=str(value), type=type)
        
    def Width(self):        
        if self.params.has_key('width'):
            return str(self.params['width']())
        else:
            return 'auto'
        
    def Height(self):
        if self.params.has_key('height'):
            return str(self.params['height']())
        else:
            return 'auto'
        
    def get_name(self):
        return self.parent.get_name()
    
    def set_parent(self, parent):
        self.parent=parent
        self.name=parent.get_name()
        self.x_pos.set_owner(self)
        self.y_pos.set_owner(self)
        self.col_span.set_owner(self)
        self.row_span.set_owner(self)
        for key,param in self.params.iteritems():
            param.set_owner(self)
        self.parames['title'].set_value(parent.get_name())

    def set_display(self, display):
        self.display=display
        for key,param in self.params.iteritems():
            param.set_display(display)

    def copy_to(self, displayname):
        for key,param in self.params.iteritems():
            param.copy_to(displayname)

    def copy(self, newparent):
        if self.parent.get_name()==newparent.get_name():
            return self
        cpy=self
        cpy.parent=newparent
        cpy.params={}        
        for key,value in self.params.iteritems():
            cpy.__dict__[key]= DisplayPropertyItem( key, self.dao.user, newparent, self.display.get_name(),value(), value.type)
            cpy.params[key]  = cpy.__dict__[key]
        return cpy

    def delete(self):
        for key in self.params:
            self.params[key].delete()
                        
    @staticmethod
    def get_properties(user, parent, display):
        daos= sqlsession.query(DisplayPropertyItem.DAO).filter_by( user=user, display=display.get_name(), parent=parent.get_name()).all()
        params={}
        for dao in daos:
            tag=dao.name
            if tag != "name":
                params[tag]=dao.value
        return DisplayProperties(name=parent, user=user, parent=parent, display=display, **params)
#    def create_properties(name, user, parent, display, x_pos, y_pos, type, **kargs):
#        return PROPERTIES_MAP[type](name=name, user=user, parent=parent, display=display, x_pos=x_pos, y_pos=y_pos, **kargs)




####################################################
####################################################

import sqlalchemy
from sqlalchemy.schema import Column, ForeignKey
from sqlalchemy.types import *
import calypso.model.meta
metadata=calypso.model.meta.metadata


DisplayPropertyItem.DAO.table=sqlalchemy.Table("TlmDisplayPropertyItems", metadata,
                                               Column('user', String(40), primary_key=True),
                                               Column('name',String(80), primary_key=True),
                                               Column('parent',String(80),ForeignKey('TlmTiles.name'), primary_key=True),
                                               Column('display',String(80),  ForeignKey('TlmDisplays.name'), primary_key=True),
                                               Column('value',String(80)),
                                               useexisting=True)


sqlalchemy.orm.mapper(DisplayPropertyItem.DAO, DisplayPropertyItem.DAO.table)
