import sys
import os.path

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))+'/scenarios')
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))+'/scenarios/'+sys.argv[1]+'/lib')

from ctypes import *

__import__(sys.argv[1])
modulename=sys.argv[1]+"."+sys.argv[2]
scenariomodule=__import__(modulename,globals(),locals(),['Launch'],-1)


launched=scenariomodule.Launch(scenario=sys.argv[1],version=sys.argv[2])
launched.startservices()
