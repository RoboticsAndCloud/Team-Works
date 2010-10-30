import sys
from calypso.model.meta import Session as sqlsession

from calypso.tlm import Monitor
from calypso.tlm.properties import *

from calypso.lib.base import BaseController, render
from pylons import request, response, session, tmpl_context as c

class MonitorFilter(object):
    table=None

    class DAO(object):
        def __init__(self,name, user, parentname,tilename,displayname):
            self.name=name
            self.user = user
            self.parent=parentname
            self.tile=tilename
            self.display=displayname
            sqlsession.add(self)
            sqlsession.commit()

    def __init__(self, user, name, parentname, tilename, displayname):
        if not(isinstance(parentname,basestring)):
            raise Exception("Type Mismatch")
        daos=sqlsession.query(MonitorFilter.DAO).filter_by \
              (user=user, display=displayname, parent=parentname, tile=tilename, name=name).all()
        if len(daos)>0:
            self.dao = daos[0]
        else:
            self.dao=MonitorFilter.DAO(name=name,user=user, displayname=displayname, tilename=tilename, parentname=parentname)

    def get_name(self):
        return self.dao.name
    
    def copy_to(self, displayname):
        sqlsession.commit()
        newfilter=MonitorFilter(user=self.dao.user, name=self.dao.name, parentname=self.dao.parent,tilename=self.dao.tile, displayname=displayname)
        self.dao=None
        self.dao=newfilter.dao
        sqlsession.commit()

    def delete(self):
        sqlsession.delete(self.dao)
        sqlsession.commit()
        del self.dao
        
class MonitorView(object):
    """
    Class to capture monitor views that appear in a telemetry display (as opposed to a format).  This is
    the most basic element of display
    """                                                                       
 
    class DAO(object):
       table=None
       def __init__(self, user, name, parentname,displayname,index=None):
            self.display=displayname
            self.parent=parentname
            self.name=name
            self.user=user
            self.index=index
            sqlsession.commit()
            sqlsession.add(self)
            sqlsession.commit()
                       
    def __init__(self, name, user, parentname, displayname,format=None):
        if not(isinstance(parentname,basestring)):
            raise Exception("Type Mismatch")
        daos=sqlsession.query(MonitorView.DAO).filter_by \
              (user=user, display=displayname, parent=parentname, name=name).all()
        if len(daos)>0:
            self.dao = sqlsession.query(MonitorView.DAO).filter_by \
              (user=user, display=displayname, parent=parentname, name=name).one()
        else:
            self.dao=MonitorView.DAO(name=name, user=user, displayname=displayname, parentname=parentname)
        self._monitor=Monitor(name,format)
        self.format=format
        filtermodels=sqlsession.query(MonitorFilter.DAO).filter_by \
                (user=user, display=displayname, parent=name, tile=parentname).all()
        self.filtermodels=[]
        for filter in filtermodels:
            self.filtermodels.append(MonitorFilter(user=user, name=filter.name, parentname=filter.parent, 
                                                   tilename=filter.tile, displayname=filter.display))
        self.filteredattrs=None
        if len(self.filtermodels)>0:
            self.filteredattrs=[]
            for attr in self.filtermodels:
                self.filteredattrs.append(attr.get_name())

    def copy_to(self, displayname):
        sqlsession.commit()
        for model in self.filtermodels:
            model.copy_to(displayname)
        newview=MonitorView(name=self.dao.name, user=self.dao.user, parentname=self.dao.parent,displayname=displayname, format=self.format, index=self.index)
        self.dao=None
        self.dao=newview.dao
        sqlsession.commit()
        
 
    def delete(self):
        for model in self.filtermodels:
            model.delete()
        self.filtermodels=[]
        self.filteredattrs=[]
        sqlsession.delete(self.dao)
        sqlsession.commit()        
        del self.dao 
        
    def get_name(self):
        try:
            return self.dao.name
        except:
            sqlsession.add(self.dao)
            return self.dao.name
        
    def get_id(self):
        return self._monitor.id
    
    def monitor(self):
        return self._monitor
    
    def set_filtered(self, filteredattrs):
        self.filteredattrs=filteredattrs
        if filteredattrs==None:
            self.filtermodels=[]
            return
        try:
            for filter in self.filtermodels:
                if not(filter.dao.name in filteredattrs):
                    filter.delete()
        except:
            pass 
        self.filtermodels=[]
        for attrname in filteredattrs:
            self.filtermodels.append(MonitorFilter(user=self.dao.user, name=attrname, parentname=self.get_name(), 
                                                   tilename=self.dao.parent, displayname=self.dao.display))
        sqlsession.commit()
        
    def filter_attributes( self, filteredattrs=None):
        """
        Display only the attributes provided
        """
        if filteredattrs==None:
            self.filteredattrs=None
        else:
            attrs=self._monitor.attrs()
            if self.filteredattrs==None: self.filteredattrs=[]
            for attr  in attrs:
                if (attr[0] in filteredattrs) and not(attr[0] in self.filteredattrs):
                    self.filteredattrs.append(attr[0])
                    self.filtermodels.append(MonitorFilter(user=self.dao.user, name=attr[0], parentname=self.get_name(), 
                                                           tilename=self.dao.parent, displayname=self.dao.display))
 

    def attrs(self,filtered=True):
        if filtered:
            return self._monitor.attrs(self.filteredattrs)
        else:
            return self._monitor.attrs(None)
           
    def contains(self, attr):
        if (self.filteredattrs == None): return True
        for fattr in self.filteredattrs:
            if fattr==attr[0]:
                return True
        return False
    
    def get_index(self):
        return self.dao.index
    
    def set_index(self,index):
        self.dao.index=index
        
####################
# Tile MV
####################
class TileModel(object):

    class DAO(object):
        table = None
        
        def __init__(self, user, name, parentname, displayname, type):
            self.type = type
            self.user = user
            self.display=displayname
            self.parent=parentname
            self.name=name
            sqlsession.add(self)
            sqlsession.commit()
           
    
    def __init__(self, user, name, parentname, displayname, type):
        daos = sqlsession.query(TileModel.DAO).filter_by(user=user, display=displayname, parent=parentname, name=name).all()
        if len(daos)>0:
            self.dao=daos[0]
            self.dao.type=type
        else:
            self.dao = TileModel.DAO(name=name, user=user, parentname=parentname,  displayname=displayname, type=type)
        monitors=sqlsession.query(MonitorView.DAO).filter_by \
           (display=displayname, parent=name).order_by(MonitorView.DAO.index).all()        
        self.monitors=[]
        for mon in monitors:
            try:
                self.monitors.append(MonitorView(name=mon.name, user=user, parentname=self.get_name(), displayname=displayname))
            except:
                del mon
                
    def get_name(self):
        try:
            return self.dao.name
        except:
            sqlsession.add(self.dao)
            return self.dao.name
        
    def set_name(self, name):
        self.dao.name = name
        sqlsession.commit()

    def set_parent(self, parentname):
        self.dao.parent=parentname
        sqlsession.add(self.dao)
        sqlsession.commit()
        
    def set_display(self, displayname):
        self.dao.display=displayname

    def copy_to(self, displayname):
        sqlsession.commit()
        name=self.dao.name
        type = self.dao.type
        parentname=self.dao.parent
        for mon in self.monitors:
            mon.copy_to(displayname=displayname)
        user=self.dao.user
        self.dao=None
        self.dao=TileModel(name=name, user=user, type=type,parentname=parentname, displayname=displayname).dao
        sqlsession.commit()

        
    def get_type(self):        
         return self.dao.type
     
    def get_monitor(self, name):
        for mon in self.monitors:
            if (mon.get_name()==name): return mon
        return None
    
    def place_monitor(self, monitor, index):
        if (monitor in self.monitors):    
            del self.monitors[index]
            self.monitors.insert(index,monitor)                    
        else:
            if index > len(self.monitors):
                #add to end
                self.monitors.append(monitor)                
            else:
                #insert new monitor
                self.monitors.insert(index,monitor)
        print self.monitors
        sqlsession.commit()
        
    def append(self, monitorview):
        if not(isinstance(monitorview, MonitorView)):
            raise Exception("Type mismatch")
        for index in range(len(self.monitors)):
            mon=self.monitors[index]
            if mon.monitor().get_name()==monitorview.monitor().get_name():
                self.monitors[index]=monitorview
                return
        self.monitors.append(monitorview)
        sqlsession.commit()

    def remove(self, monitorname):
        index=0
        for monitor in self.monitors:            
            if monitor.get_name()==monitorname:
                monitor.delete()
                break;
            index+=1
        if (index < len(self.monitors)):
            del self.monitors[index]
            
    def delete(self):
        sqlsession.flush()
        sqlsession.delete(self.dao)
        sqlsession.flush()
        for monitor in self.monitors:
            monitor.delete()
        del self.monitors
        sqlsession.commit()
        del self.dao
        self.monitors=[]


    @staticmethod
    def get_models(user, displayname, parentname):
        daos=  sqlsession.query(TileModel.DAO).filter_by(user = user, display=displayname, parent=parentname).all()
        models=[]
        for dao in daos:
            models.append(TileModel(name=dao.name, user=user, displayname=displayname, parentname=parentname, type=dao.type))
        return models
    

class Tile(object):
    
    def __init__(self,user, name, parent, display, type):
        self.user=user
        self._model = TileModel(name=name, user=user, displayname=display.get_name(), parentname=parent.get_name(), type=type)
        self.parent=parent
        self.display=display
        self._model.user=user
        
    def delete(self):
        self._model.delete()
        self.parent=None
        self.display=None
        
    def get_name(self):
        return self._model.get_name()
    
    def set_name(self, newname):
        if self._model.get_name() != newname:
            self._model.set_name(newname)

    def copy_to(self, displayname):
        self._model.copy_to(displayname=displayname)

    def get_monitor(self, name):        
        monitor = self._model.get_monitor(name)
        if monitor==None:           
            monitor=MonitorView(name=name, user=self.user, displayname=self.display.get_name(), parentname=self.get_name(), format=self.display.format)
        return monitor
    
    def place_monitor(self, monitorname, index):
        #will create monitor if nonexistent:
        try:
            monitor=self.get_monitor(monitorname)     
            self._model.place_monitor(monitor, index)
        except:
            pass
        
    def append(self, monitorview):
        self._model.append(monitorview)

    def remove_monitor(self, monitorname):
        self._model.remove(monitorname)
    
    def clear(self):
        for monitor in self._model.monitors:
            self._model.remove(monitor.get_name())
         
         
    def render_html(self, properties, for_editing=False):
        sqlsession.flush()        
        sqlsession.commit()
        c.formatview= self.get_name().replace(' ','_')
        c.properties=properties
        c.monitors=self.monitors()
        c.flatattrs={}
        c.x_pos=properties.x_pos()
        c.y_pos=properties.y_pos()
        for mon in c.monitors:
            for attr in mon.attrs():
                if not(c.flatattrs.has_key(attr[0])):
                    c.flatattrs[attr[0]]=attr
        c.content_type = 'html'
        c.name         = self.display.format.name
        c.tile = self
        c.display_ops=for_editing
        try:
            return render('/tlm/develop/Visualization-tile_view.html');
        except:
            import traceback
            traceback.print_exception(sys.exc_info()[0], sys.exc_info()[1], sys.exc_info()[2])
            return "<b><i>ERROR rendering tile</i></b>"
        
    def content_type(self):
        #if self._model.type=='heatmap':
        #    return 'application/xhtml+xml'
        #else:
            return 'application/xhtml+xml'
    
    def get_type(self):
        return self._model.get_type()
    
    def set_parent(self, parentname):
        self._model.set_parent(parentname)
        
    def set_display(self, display):
        self._model.set_display(display.get_name())
        
    def monitor_count(self):
        return len(self._model.monitors)

    def monitors(self):
        return self._model.monitors
    

    def model(self):
        return self._model

    
    
    

import sqlalchemy
from sqlalchemy.schema import Column, ForeignKey
from sqlalchemy.types import *
import calypso.model.meta
metadata=calypso.model.meta.metadata

MonitorView.DAO.table=sqlalchemy.Table('TlmTileMonitors', metadata,
                                       Column('user', String(40), primary_key=True),
                                       Column('name',String(80), primary_key=True),
                                       Column('parent',String(80), ForeignKey("TlmTiles.name"), primary_key=True),
                                       Column('display',String(80), ForeignKey('TlmDisplays.name'), primary_key=True),
                                       Column('index',Integer),
                                       useexisting=True)

MonitorFilter.DAO.table=sqlalchemy.Table('TlmTileMonitorFilters', metadata,
                                         Column('user', String(40), primary_key=True),
                                         Column('name',String(80), primary_key=True),
                                         Column('parent',String(80), ForeignKey("TlmTileMonitors.name"), primary_key=True),
                                         Column('tile',String(80), ForeignKey("TlmTiles.name"), primary_key=True),
                                         Column('display',String(80), ForeignKey('TlmDisplays.name'), primary_key=True),
                                         useexisting=True)


TileModel.DAO.table=sqlalchemy.Table("TlmTiles", metadata,
                                     Column('user', String(40), primary_key=True),
                                     Column('name',String(80), primary_key=True),
                                     Column('parent',String(80),ForeignKey("TlmWindows.name"), primary_key=True),
                                     Column('display',String(80), ForeignKey("TlmDisplays.name"), primary_key=True),
                                     Column('type',String(20)),
                                     useexisting=True)




"""map tables to database"""
sqlalchemy.orm.mapper(MonitorFilter.DAO, MonitorFilter.DAO.table)
sqlalchemy.orm.mapper(MonitorView.DAO, MonitorView.DAO.table)
sqlalchemy.orm.mapper(TileModel.DAO, TileModel.DAO.table)
print "HERE#################"
