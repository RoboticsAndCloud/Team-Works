import sys
import os.path
from ctypes import *

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))+'/scenarios')

class Launcher:
    def __init__(self, scenario, version, partition):
        self.module=__import__(scenario + "." + version,globals(),locals(),['Launch'],-1)
        LDPATH=os.path.dirname(os.path.dirname(os.path.dirname(__file__)))+'/scenarios/'+scenario+'/'+version + "/" +  os.uname()[0] + "_" + os.uname()[4]  + "/lib/"
        lib=LDPATH+"libscenario_"+scenario+"_exports.so"
        cdll.LoadLibrary(lib)
        self.dll=CDLL(lib)
        #self.dll.adainit()
        #self.dll.Sim_Allocate(self.module.filekey(),2)
        tag=scenario + "." + version
        eval( "self.module." + partition )(self.dll)

Launcher(scenario=sys.argv[1], version=sys.argv[2], partition=sys.argv[3])
