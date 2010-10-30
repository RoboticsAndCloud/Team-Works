from calypso.tlm import *
from calypso.lib.base import render

from pylons import request, response, session, tmpl_context as c

class MonitorView(Monitor):
    """
    Class to capture monitor views that appear in a telemetry display (as opposed to a format).  This is
    the most basic element of display
    """                                                                       
    table=None

    def __init__(self,name,format=None):
        Monitor.__init__(self,name,format)
        self.filteredout=[]
    
    def filter_attributes( self, filteredattrs):
        """
        Display only the attributes provided
        """
        self.filteredout=[]
        myattrs=self.attrs()
        for attr in myattrs:
            if not(attr[0] in filteredattrs):
                self.filteredout.append(attr[0])

#    def value(self):
#        return Monitor.value(self,self.filteredout)

    def attrs(self):
        return Monitor.attrs(self, self.filteredout)


class DisplayProperties(object):
    """
    Class to capture display properties for displaying tiles within a table or in a plot
    """
    table=None

    def __init__(self, id, pos_x, pos_y, col_span=1, row_span=1, timespan=30, ymin=0, ymax=100, width=600, height=300):
        self.tileid=id
        self.x_pos=pos_x
        self.y_pos=pos_y
        self.col_span=col_span
        self.row_span=row_span
        self.timespan=timespan
        self.ymin=ymin
        self.ymax=ymax
        self.width=width
        self.height=height

    def copy(self):
        return DisplayProperties(self.tileid, self.x_pos, self.y_pos, self.col_span, self.row_span,self.timespan, self.ymin, self.ymax)

class Tile(object):
    
    table=None
    
    def __init__(self,name, type):
        self.type = type
        self.monitors=calypso.db.session.sqlsession.query(MonitorView).filter_by(parent=name).all()
        self.name=name



    def append(self, monitor):
        self.monitors.append(monitor)

    
    def render_html(self, properties):
        c.formatview=self.name
        c.properties=properties
        c.monitors=self.monitors
        c.name=session.usersession.display.format.name
        return render('/tlm/format_'+self.type+'_view.html')




class TelemetryWindow(object):
    table=None
        
    def __init__(self,name):
        self.name=name
        tiles=calypso.db.session.sqlsession.query(Tile).filter_by(display=name).all()
        for tile in tiles:
            tileproperties=calypso.db.session.sqlsession.query(DisplayProperties).filter_by(tileid=tile.name).all()
            self.place_tile(tile,tileproperties)
        session.usersession.display=self


    def place_tile(self, tile, properties):
        while properties.y_pos >= len(self.tiles):
            self.tiles.append([])
        while properties.x_pos >= len(self.tiles[properties.y_pos]):
            self.tiles[properties.y_pos].append([])
        self.tiles[properties.y_pos][properties.x_pos]={'content':tile, 'properties':properties.copy()}

        
    def render_html(self):
        c.name=self.name
        c.tiles=self.tiles
        c.scenario=session.usersession.scenario
        c.version =session.usersession.version        
        c.format  =session.usersession.display.format
        return render ('/tlm/telemetrydisplay.html')


class TelemetryDisplay:

    displays={}

    def __init__(self,name, format):
        self.name=name
        self.tabs=[]
        self.format=format
        TelemetryDisplay.displays[name]=self
        print "ADDING DISPLAY " + name
        
    def append_tab(self, window):
        self.tabs.append(window)

    def render_html(self):
        c.name=self.name
        c.scenario=session.usersession.scenario
        c.version=session.usersession.version
        session.usersession.display.format.connect()
        c.format=session.usersession.display.format
        c.tabs=self.tabs        
        c.selected=self.tabs[session.usersession.selectedtab].name
        c.tiles=self.tabs[session.usersession.selectedtab].tiles
        return render ('/tlm/telemetrydisplay.html')


import sqlalchemy
from sqlalchemy.schema import Column
from sqlalchemy.types import *
import calypso.model.meta
metadata=calypso.model.meta.metadata

    
MonitorView.table=sqlalchemy.Table('format_tiles', metadata,
                               Column('name',String(80), primary_key=True),
                               Column('parent',String(80),primary_key=True),
                               useexisting=True)

DisplayProperties.table=sqlalchemy.Table('table_display_properties', metadata,
                                              Column('id',String(80), primary_key=True),
                                              Column('x_pos',Integer),
                                              Column('y_pos',Integer),
                                              Column('col_span',Integer),
                                              Column('row_span',Integer),
                                              useexisting=True)

Tile.table=sqlalchemy.Table('format_displays23', metadata,
                               Column('name',String(80), primary_key=True),
                               Column('display',String(80),primary_key=True),
                               useexisting=True)

"""map tables to database"""
sqlalchemy.orm.mapper(MonitorView, MonitorView.table)
sqlalchemy.orm.mapper(Tile, Tile.table)
sqlalchemy.orm.mapper(DisplayProperties, DisplayProperties.table)

