import sqlalchemy
import calypso.net

class Asset(object):
    """Class to define an available asset based on a name,
    host address and port for connection."""
    table = None
    name = None
    host = None
    port = None
    
    def __init__(self,name, host, port):
        self.name = name
        self.host = host
        self.port = port
        

class Topology(object):
    """Class to define a topology (in this case a simple list)
    of hosts, defined by a name, host address and port"""

    def __init__(self):
        self._hosts=calypso.db.session.query(Asset).order_by(Asset.name).all()
        self._hostdict = {}
        for item in self._hosts:
            self._hostdict[item.name]=item
            
    def add_asset(self, asset):
        self._hosts.append(asset)
        calypso.db.session.add( asset)

    def add_asset_by_name(self, assetname, host, port):
        self.add_asset(Asset(assetname, host, port))

    def remove_asset(self, asset):
        self._hosts.remove(asset)
        del  self._hostdict[asset.name]
        calypso.db.session.delete(asset)

    def remove_asset_by_name(self, assetname):
        self.remove_asset( self._hostdict[assetname] )

    def hosts(self):
        return self._hosts

    def hostdict(self):
        return self._hostdict

    
from sqlalchemy.schema import Column
from sqlalchemy.types import *
import calypso.model.meta
metadata=calypso.model.meta.metadata

Asset.table=sqlalchemy.Table('topology', metadata,
                                         Column('name', String(80), primary_key=True),
                                         Column('host', String(32)),
                                         Column('port', Integer),
                                         useexisting=True);

sqlalchemy.orm.mapper(Asset, Asset.table)
