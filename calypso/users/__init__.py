import sqlalchemy

from calypso.model.meta import Session as sqlsession

class UserSession:
    user = None
    active = False
    timestamp = None



    def __init__(self, user):
        logout()
        UserSession.active = user.verify()


    
    def session_expired(self):
        sql="SELECT timestamp FROM users WHERE userid='"+user+"' AND (timestamp-0)>(CURRENT_TIMESTAMP-7200);"
        pass
    
"""================================================================"""
 
class Role(object):
    id = None
    name = None
    table = None
    
    def __init__(self,id,name):
        self.id = id
        self.name = name
        try:            
            if (sqlsession.query(Role).filter_by(id=self.id).count() == 0):
                sqlsession.add(self)
        except:
            sqlsession.add(self)
            

"""================================================================="""

class User(object):
    userid=None
    password=None
    table=None
    email=None
    firstname=None
    lastname=None
    
    def verify(self):
        return sqlsession.query(User).filter_by(userid=self.userid,password=self.password).count()>0

    def __init__(self,name,password):
        self.password=password
        self.userid = name
        try:
            self.lastname=sqlsession.query(User).filter_by(userid=self.userid).one().lastname
            self.firstname=sqlsession.query(User).filter_by(userid=self.userid).one().firstname
        except:
            self.lastname=self.userid
            self.firstname=''

    def set_name(first, last):
        self.lastname=last
        self.firstname=first
            
    def verify_is_admin(self):
        try:
            user = sqlsession.query(User).filter_by(userid=self.userid,password=self.password).one()
            return sqlsession.query(UserRoleMapping).filter_by(userid=self.userid,roleid=Role.ADMIN.id).count()>0
        except:
            print "No such user"
            return False
        
    def create(self, admin):
        if admin.verify_has_admin():
            sqlsession.add(self)

"""=================================================================="""

class UserRoleMapping(object):
    userid = None
    roleid = None
    id = 1
    
    def __init__(self, user,role):
        self.userid=user.userid
        try:
            self.id=sqlsession.query(UserRoleMapping).filter_by(userid=user.userid, roleid=role.id).first().id
        except:
            self.roleid=role.id
            UserRoleMapping.id = UserRoleMapping.id+1
            self.id = UserRoleMapping.id
            sqlsession.add(self)

        

            

from sqlalchemy.schema import Column
from sqlalchemy.types import *
import calypso.model.meta
metadata=calypso.model.meta.metadata


User.table=sqlalchemy.Table('users',metadata,
                            Column('userid',Integer,primary_key=True),
                            Column('password',String(80), nullable=False),
                            Column('firstname',String(80)),
                            Column('lastname',String(80)),
                            Column('email',String(240)),
                            Column('timestamp',DateTime()),
                            useexisting=True)

Role.table=sqlalchemy.Table('roles',metadata,
                            Column('id',Integer,primary_key=True),
                            Column('name',String(80), nullable=False),
                            useexisting=True)

UserRoleMapping.table=sqlalchemy.Table('userroles',metadata,
                            Column('id',Integer,primary_key=True),
                            Column('userid',String(80), nullable=False),
                            Column('roleid',Integer, nullable=False),
                            useexisting=True)

"""map tables to database"""
sqlalchemy.orm.mapper(User, User.table)
sqlalchemy.orm.mapper(Role, Role.table)
sqlalchemy.orm.mapper(UserRoleMapping, UserRoleMapping.table)


"""Setup user and user roles for basic admin"""
import hashlib

try:
    User.ROOT = sqlsession.query(User).filter_by(userid="admin").one()
    User.ROOT.password=hashlib.md5("admin").hexdigest()
    sqlsession.commit()
except:
    User.ROOT= User("admin", hashlib.md5("admin").hexdigest())
    sqlsession.add(User.ROOT)
    sqlsession.commit()
Role.ADMIN = Role(1,"admin")
Role.DEVELOPER = Role(2,"developer")
Role.PRODCUT_MANAGER=Role(3,"product_manager")

UserRoleMapping.ROOT = UserRoleMapping(User.ROOT,Role.ADMIN)

